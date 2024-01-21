import { Component } from './base/Component';
import { Currency, IProduct } from '../types/index';
import {
	bem,
	createElement,
	ensureElement,
	formatNumber,
} from '../utils/utils';
import { ProductOrdered } from '../types/index';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard<T> {
	category: string;
	title: string;
	image: string;
	price: Currency;
	description: string;
}

export class Card<ProductStatus> extends Component<ICard<ProductStatus>> {
	protected _category: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected _price?: HTMLButtonElement;

	private categoryMap: Record<string, string> = {
		'софт-скил': '_soft',
		'другое': '_other',
		'дополнительное': '_additional',
		'кнопка': '_button',
		'хард-скил': '_hard',
	};

	constructor(
		protected blockName: string,
		container: HTMLElement,
		actions?: ICardActions
	) {
		super(container);

		this._category = ensureElement<HTMLElement>(
			`.${blockName}__category`,
			container
		);
		this._title = ensureElement<HTMLElement>(`.${blockName}__title`, container);
		this._image = ensureElement<HTMLImageElement>(
			`.${blockName}__image`,
			container
		);
		this._button = container.querySelector(`.${blockName}__button`);
		this._description = container.querySelector(`.${blockName}__description`);
		this._price = container.querySelector(`.${blockName}__price`);

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set category(value: string) {
		this.setText(this._category, value);

		const baseClass = this._category.classList[0];
		this._category.className = '';
		this._category.classList.add(`${baseClass}`);
		this._category.classList.add(`${baseClass}${this.categoryMap[value]}`);
	}

	set price(value: string) {
		this.setText(this._price, value ? value : 0);
	}
}

export class CatalogItem extends Card<IProduct> {
	protected _status: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('card', container, actions);
		// this._status = ensureElement<HTMLElement>(`.card__status`, container);
	}

	// set status({ status, label }: CatalogItem) {
	//     this.setText(this._status, label);
	//     this._status.className = clsx('card__status', {
	//         [bem(this.blockName, 'status', 'active').name]: status === 'active',
	//         [bem(this.blockName, 'status', 'closed').name]: status === 'closed'
	//     });
	// }
}

// export class AuctionItem extends Card<HTMLElement> {
//     protected _status: HTMLElement;

//     constructor(container: HTMLElement, actions?: ICardActions) {
//         super('lot', container, actions);
//         this._status = ensureElement<HTMLElement>(`.lot__status`, container);
//     }

//     set status(content: HTMLElement) {
//         this._status.replaceWith(content);
//     }
// }

export class CardPreview extends Component<IProduct> {
	protected _category: HTMLElement;
	protected _title: HTMLElement;
	protected _description: HTMLElement;
	protected _button: HTMLButtonElement;
	protected _price: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._category = ensureElement<HTMLElement>(`.card__category`, container);
		this._title = ensureElement<HTMLElement>(`.card__title`, container);
		this._description = ensureElement<HTMLInputElement>(
			`.card__text`,
			container
		);
		this._button = ensureElement<HTMLButtonElement>(`.card__button`, container);
		this._price = ensureElement<HTMLElement>(`.card__price`, container);

		this._button.addEventListener('onClick', (event: MouseEvent) => {
			event.preventDefault();
			actions.onClick?.(event);
			return false;
		});
	}

	set category(value: string) {
		this.setText(this._category, value);
	}
	set title(value: string) {
		this.setText(this._title, value);
	}
	set description(value: string) {
		this.setText(this._description, value);
	}
	set price(value: number) {
		this.setText(this._price, value);
	}

}

export interface ItemBasket {
	amount: number;
	title: string;
	price: number;
}

export class BasketItem extends Card<ItemBasket> {
	protected _amount: HTMLElement;
	protected _title: HTMLElement;
	protected _toDelete: HTMLInputElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super('basket__list', container, actions);
		this._amount = ensureElement<HTMLElement>(`.basket__item-index`, container);
		this._title = ensureElement<HTMLElement>(`.card__title`, container);
		this._toDelete = container.querySelector(`.basket__item-delete`);

		if (!this._button && this._toDelete) {
			this._toDelete.addEventListener('onClick', (event: MouseEvent) => {
				actions?.onClick(event);
			});
		}
	}

	// set status({ amount, status }: ItemBasketStatus) {
	//     this.setText(this._amount, formatNumber(amount));

	//     if (status) this.setVisible(this._status);
	//     else this.setHidden(this._status);
	// }
}
