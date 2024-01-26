export type Id = string;
export type Currency = number | null;
export type PaymentMethod = 'card' | 'cash' | '';

// типизация структуры карточки товара
export interface IProduct {
	id: Id;
	description: string;
	image: string;
	title: string;
	category: string;
	price: Currency;
	status: boolean;
}

// типизация полей формы ввода контактов
export interface IContactForm {
	email: string;
	phone: string;
}

// типизация полей формы ввода формы оплаты и адреса
export interface IDeliveryForm {
	payment: PaymentMethod;
	address: string;
}

// расширение типов форм до данных заказа
export type IOrder = IContactForm &
	IDeliveryForm & {
		items: Id[];
		total: number;
	};

// типизация получения ответа сервера на отправку заказа
export interface IOrderResult {
	id: Id;
	total: Currency;
}

// типизация записи об ошибке - поле заказа - текст ошибки
export type FormErrors = Partial<Record<keyof IOrder, string>>;

// типизация данных бизнес-логики приложения
export interface IAppState {
	catalog: IProduct[];
	basket: string[];
	preview: string | null;
	order: IOrder | null;
	loading: boolean;
}
