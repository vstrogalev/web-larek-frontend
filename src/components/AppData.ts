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
	addProduct(item: IProduct) {
		this.basket.push(item);
		this.emitChanges('basket:changed');
	}

	// удаление товара
	deleteProduct(id: string) {
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
  resetOrder() {
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

	completeOrder(): void {
		this.order.total = this.getTotal();
		this.order.items = this.getOrderedProducts().map((item) => item.id);
	}

	setPaymentMethod(method: string) {
		this.order.payment = method as PaymentMethod;
    if (this.validateDelivery()) {
			this.events.emit('delivery:ready', this.order);
		}
	}

	setAddress(value: string) {
		this.order.address = value;

		if (this.validateDelivery()) {
			this.events.emit('delivery:ready', this.order);
		}
	}

	validateDelivery(): boolean {
		const errors: typeof this.formErrors = {};

		if (!this.order.payment) {
			errors.payment = 'Необходимо указать способ оплаты';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.events.emit('formDeliveryErrors:change', this.formErrors);

		return Object.keys(errors).length === 0;
	}

	setContactsField(field: keyof IContactForm, value: string): void {
		this.order[field] = value;

		if (this.validateContacts()) {
			this.events.emit('contacts:ready', this.order);
		}
	}

	validateContacts(): boolean {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('formContactsErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}
