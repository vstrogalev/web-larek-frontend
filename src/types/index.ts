export type Id = string;
export type Currency = number | null;
export type PaymentMethod = 'card' | 'cash' | '';

export interface IProduct {
	id: Id;
	description: string;
	image: string;
	title: string;
	category: string;
	price: Currency;
	status: boolean;
}

export interface IContactForm {
	email: string;
	phone: string;
}

export interface IDeliveryForm {
	payment: PaymentMethod;
	address: string;
}

export type IOrder = IContactForm &
	IDeliveryForm & {
		items: Id[];
		total: number;
	};

export interface IOrderResult {
	id: Id;
	total: Currency;
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IAppState {
	catalog: IProduct[];
	basket: string[];
	preview: string | null;
	order: IOrder | null;
	loading: boolean;
}
