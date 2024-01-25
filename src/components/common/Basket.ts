import { Component } from '../base/Component';
import {
	createElement,
	ensureElement,
	formatNumber,
} from '../../utils/utils';
import { EventEmitter } from '../base/events';

interface IBasketView {
	items: HTMLElement[];
	total: number;
}

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('delivery:open');
			});
		}

		this.items = [];
	}

	/**
	 * Получает на вход массив элементов и
	 * если не пустой, то добавляет их как детей
	 * если пустой, то отображает Корзина пуста
	 */
	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
			this.setDisabled(this._button, false);
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this.setDisabled(this._button, true);
		}
	}

	/**
	 * Меняет количество товаров, отображаемое на кнопке Корзины
	 */
	set total(total: number) {
		this.setText(this._total, formatNumber(total));
	}
}
