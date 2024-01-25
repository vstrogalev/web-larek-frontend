import { Form } from './common/Form';
import { IDeliveryForm } from '../types';
import { IEvents } from './base/events';
import {ensureElement} from "../utils/utils";

export class Delivery extends Form<IDeliveryForm> {
  protected _paymentContainer: HTMLDivElement;
  protected _paymentButtons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
    this._paymentContainer = ensureElement<HTMLDivElement>('.order__buttons', this.container);
    this._paymentButtons = Array.from(this._paymentContainer.querySelectorAll('.button_alt'));

    this._paymentContainer.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLButtonElement;

      this.setClassPaymentMethod(target.name);

      events.emit(`payment:${target.name}`, {target: target.name})
    })
	}

  setClassPaymentMethod(className: string): void {
    this._paymentButtons.forEach(btn => {
      if(btn.name === className) {
        btn.classList.add('button_alt-active');
      } else {
        btn.classList.remove('button_alt-active');
      }
    })
  }

  set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
