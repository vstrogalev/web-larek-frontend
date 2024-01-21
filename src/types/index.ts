export type Id = string;
export type Currency = number | null;
export type DeliveryMethod = "online" | "onDelivery";
export type ProductOrdered = boolean;

export interface IProduct {
  id: Id;
  description: string;
  image: string;
  title: string;
  category: string;
  price: Currency;
  status: boolean;
}

export interface IOrderForm {
  payment: DeliveryMethod;
  email: string;
  phone: string;
  address: string;
  total: Currency;
}

export interface IOrder extends IOrderForm {
  items: Id[];
}

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