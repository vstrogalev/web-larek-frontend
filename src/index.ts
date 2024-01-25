import './scss/styles.scss';

import { LarekAPI } from './components/LarekAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppState, CatalogChangeEvent, Product } from './components/AppData';
import { Page } from './components/Page';

import { Card, BasketItem } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';

import { IContactForm, IDeliveryForm } from './types';
import { Contacts } from './components/Contacts';
import { Success } from './components/common/Success';
import { Delivery } from './components/Delivery';

const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
	console.log('EVENT LOGGER ', eventName, data);
});

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');

const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');

const deliveryTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate(basketTemplate), events);

const deliveryForm = new Delivery(cloneTemplate(deliveryTemplate), events);
const contactsForm = new Contacts(cloneTemplate(contactsTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on<CatalogChangeEvent>('catalog:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card('card', cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.render({
			category: item.category,
			title: item.title,
			image: item.image,
			price: item.price,
		});
	});

	page.counter = appData.getOrderedProducts().length;
});

// Изменилось состояние валидации формы доставки
events.on('formDeliveryErrors:change', (errors: Partial<IDeliveryForm>) => {
	const { payment, address } = errors;
	deliveryForm.valid = !payment && !address;
	deliveryForm.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

// Изменился адрес доставки
events.on(
	/^order\..*:change/,
	(data: { value: string }) => {
		appData.setAddress(data.value);
	}
);

// Открыть форму доставки
events.on('delivery:open', () => {
	modal.render({
		content: deliveryForm.render({
			payment: 'card',
			address: '',
			valid: false,
			errors: [],
		}),
	});
});

// выбрана оплата
events.on(/^payment:.*/, (data: { target: string }) => {
	appData.setPaymentMethod(data.target);
});

// Отправлена форма заказа
events.on('order:submit', () => {
	events.emit('contacts:open');
});

// Изменилось состояние валидации формы контактов
events.on('formContactsErrors:change', (errors: Partial<IContactForm>) => {
	const { email, phone } = errors;
	contactsForm.valid = !email && !phone;
	contactsForm.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join('; ');
});

// Изменилось одно из полей контактов
events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IContactForm; value: string }) => {
		appData.setContactsField(data.field, data.value);
	}
);

// Открыть форму контактов
events.on('contacts:open', () => {
	modal.render({
		content: contactsForm.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

// Отправлена форма заказа
events.on('contacts:submit', () => {
	appData.completeOrder();

	api
		.orderProducts(appData.order)
		.then((result) => {
			const success = new Success(
				cloneTemplate(successTemplate),
				appData.order.total,
				{
					onClick: () => {
						modal.close();
						appData.clearBasket();
            deliveryForm.setClassPaymentMethod('')
						events.emit('basket:changed');
					},
				}
			);

			modal.render({
				content: success.render({}),
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

// Открыть корзину
events.on('basket:open', () => {
	modal.render({
		content: createElement<HTMLElement>('div', {}, [basket.render()]),
	});
});

// Изменения в корзине
events.on('basket:changed', () => {
	page.counter = appData.getOrderedProducts().length;

	let total = 0;
	basket.items = appData.getOrderedProducts().map((item, idx) => {
		const card = new BasketItem(cloneTemplate(cardBasketTemplate), idx, {
			onClick: (event) => {
				appData.deleteProduct(item.id);
				basket.total = appData.getTotal();
			},
		});
		total += item.price;
		return card.render({
			title: item.title,
			price: item.price,
		});
	});

	basket.total = total;
});

/**
 * Открыть карточку товара
 */
events.on('card:select', (item: Product) => {
	appData.setPreview(item);
});

/**
 * Добавить товар в корзину
 */
events.on('product:added', (item: Product) => {
	appData.addProduct(item);
	modal.close();
	events.emit('basket:changed');
});

// Изменен открытый выбранный товар
events.on('preview:changed', (item: Product) => {
	const showItem = (item: Product) => {
		const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
			onClick: () => events.emit('product:added', item),
		});

		modal.render({
			content: card.render({
				category: item.category,
				title: item.title,
				description: item.description,
				image: item.image,
				price: item.price,
			}),
		});
	};

	if (item) {
		api
			.getProduct(item.id)
			.then((result) => {
				item.id = result.id;
				item.category = result.category;
				item.title = result.title;
				item.description = result.description;
				item.image = result.image;
				item.price = result.price;
				showItem(item);
			})
			.catch((err) => {
				console.error(err);
			});
	} else {
		modal.close();
	}
});

// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
	page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
	page.locked = false;
});

// Получаем лоты с сервера
api
	.getProductList()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
