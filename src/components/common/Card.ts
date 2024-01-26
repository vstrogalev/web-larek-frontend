import { Component } from '../base/Component';
import { Currency } from '../../types/index';
import { ensureElement, formatNumber } from '../../utils/utils';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard {
	category: string;
	title: string;
	image: string;
	price: Currency;
	description: string;
}

export class Card extends Component<ICard> {
	protected _category: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected _price?: HTMLButtonElement;

	private categoryMap: Record<string, string> = {
		'софт-скил': '_soft',
		другое: '_other',
		дополнительное: '_additional',
		кнопка: '_button',
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

	set price(value: number) {
		this.setText(
			this._price,
			value ? `${formatNumber(value)} синапсов` : 'Бесценно'
		);
	}

	get price(): number {
		return Number(this._price.textContent) || 0;
	}
}

export interface ItemBasket {
	title: string;
	price: number;
}

export class BasketItem extends Component<ItemBasket> {
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _toDelete: HTMLButtonElement;

	constructor(container: HTMLElement, index: number, actions?: ICardActions) {
		super(container);

		this._index = ensureElement<HTMLElement>(`.basket__item-index`, container);
		this.setText(this._index, index + 1);

		this._title = ensureElement<HTMLElement>(`.card__title`, container);
		this._price = ensureElement<HTMLElement>(`.card__price`, container);

		this._toDelete = container.querySelector(`.card__button`);
		this._toDelete.addEventListener('click', (event: MouseEvent) => {
			event.preventDefault();
			actions.onClick?.(event);
			return false;
		});
	}

	set index(value: number) {
		this.setText(this._index, value + 1);
	}
	set title(value: string) {
		this.setText(this._title, value);
	}
	set price(value: number) {
		this.setText(
			this._price,
			value ? `${formatNumber(value)} синапсов` : 'Бесценно'
		);
	}

	render(data: ItemBasket): HTMLElement {
		Object.assign(this as object, data ?? {});
		return this.container;
	}
}
