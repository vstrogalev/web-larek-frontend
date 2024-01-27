import { Model } from './base/Model';
import { IEvents } from '../components/base/events';
import {
	FormErrors,
	IAppState,
	IProduct,
	IOrder,
	IContactForm,
	Currency,
	Id,
	PaymentMethod,
} from '../types';

export type CatalogChangeEvent = {
	catalog: Product[];
};

export class Product extends Model<IProduct> implements IProduct {
	id: Id;
	description: string;
	image: string;
	title: string;
	category: string;
	status: boolean;
	price: Currency;
}

export class AppState extends Model<IAppState> {
	basket: IProduct[];
	catalog: IProduct[];
	loading: boolean;
	order: IOrder;
	preview: string | null;
	formErrors: FormErrors = {};

	constructor(data: Partial<IAppState>, protected events: IEvents) {
		super(data, events);
    this.resetOrder();
		this.basket = [];
	}

	// добавление товара
	addProduct(item: IProduct): void {
		this.basket.push(item);
		this.emitChanges('basket:changed');
	}

	// удаление товара
	deleteProduct(id: string): void {
		this.basket = this.basket.filter((item) => item.id !== id);
		this.emitChanges('basket:changed');
	}

	// очищает корзину, устанавливает изначальное состояние
  clearBasket(): void {
		this.basket = [];
    this.resetOrder();
		this.emitChanges('basket:changed');
	}

  // сбрасывает заказ в начальное состояние
  resetOrder(): void {
    this.order = {
      payment: '',
      email: '',
      phone: '',
      address: '',
      items: [],
      total: 0,
    };
  }

	getTotal(): number {
		return this.basket.reduce((total, item) => total + item.price, 0);
	}

	setCatalog(items: IProduct[]): void {
		this.catalog = items.map((item) => new Product(item, this.events));
		this.emitChanges('catalog:changed', { catalog: this.catalog });
	}

	getOrderedProducts(): IProduct[] {
		return this.basket;
	}

  productOrdered(item: IProduct): boolean {
    return this.basket.includes(item);
  }

	completeOrder(): void {
		this.order.total = this.getTotal();
		this.order.items = this.getOrderedProducts().map((item) => item.id);
	}

	setPaymentMethod(method: string): void {
		this.order.payment = method as PaymentMethod;
    this.validateDelivery()
	}

	setAddress(value: string): void {
		this.order.address = value;

    this.validateDelivery()
	}

	validateDelivery(): void {
		const errors: typeof this.formErrors = {};

		if (!this.order.payment) {
			errors.payment = 'Необходимо указать способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('formDeliveryErrors:change', this.formErrors);

	}

	setContactsField(field: keyof Partial<IContactForm>, value: string): void {
		this.order[field] = value;

    this.validateContacts();
	}

	validateContacts(): void {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('formContactsErrors:change', this.formErrors);
	}
}
