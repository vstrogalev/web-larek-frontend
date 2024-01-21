import _ from "lodash";
import {dayjs, formatNumber} from "../utils/utils";

import {Model} from "./base/Model";
import {IEvents} from "../components/base/events";
import {FormErrors, IAppState, IProduct, IOrder, IOrderForm,  Currency, Id, DeliveryMethod} from "../types";

export type CatalogChangeEvent = {
    catalog: Product[]
};

export class Product extends Model<IProduct> implements IProduct {
    id: Id;
    description: string;
    image: string;
    title: string;
    category: string;
    status: boolean;
    price: Currency;

    productOrdered(price: number): void {
        this.price = price;

        this.emitChanges('basket:changed', { id: this.id, price });
    }

}

export class AppState extends Model<IAppState> {
    basket: Product[];
    catalog: Product[];
    loading: boolean;
    order: IOrder = {
        email: '',
        phone: '',
        address: '',
        items: [],
        total: 0,
        payment: "online"
    };
    preview: string | null;
    formErrors: FormErrors = {};

    constructor(data: Partial<IAppState>, protected events: IEvents) {
      super(data, events);
      this.basket = [];
    }

    // !!! исключение, включение товара
    toggleOrderedProduct(id: string, isIncluded: boolean) {
        if (isIncluded) {
            this.order.items = _.uniq([...this.order.items, id]);
        } else {
            this.order.items = _.without(this.order.items, id);
        }
    }

    clearBasket() {
        this.order.items.forEach(id => {
            this.toggleOrderedProduct(id, false);
        });
    }

    getTotal() {
        return this.order.items.reduce((a, c) => a + this.catalog.find(it => it.id === c).price, 0)
    }

    setCatalog(items: IProduct[]) {
        this.catalog = items.map(item => new Product(item, this.events));
        this.emitChanges('items:changed', { catalog: this.catalog });
    }

    getOrderedProducts(): Product[] {
        return this.basket;
    }

    setPreview(item: Product) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    setOrderField(field: keyof IOrderForm, value: IOrderForm) {
        // this.order[field] = value;

        if (this.validateOrder()) {
            this.events.emit('order:ready', this.order);
        }
    }


    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}