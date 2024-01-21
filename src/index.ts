import './scss/styles.scss';

import {LarekAPI} from "./components/LarekAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {EventEmitter} from "./components/base/events";
import {AppState, CatalogChangeEvent, Product} from "./components/AppData";
import {Page} from "./components/Page";

import {CardPreview, BasketItem, CatalogItem} from "./components/Card";
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";

import {Currency, IOrderForm, DeliveryMethod} from "./types";
import {Order} from "./components/Order";
import {Success} from "./components/common/Success";

const events = new EventEmitter();
const api = new LarekAPI(CDN_URL, API_URL);

// Чтобы мониторить все события, для отладки
events.onAll(({ eventName, data }) => {
    console.log(eventName, data);
})

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
// const auctionTemplate = ensureElement<HTMLTemplateElement>('#auction');

const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
// const bidsTemplate = ensureElement<HTMLTemplateElement>('#bids');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
// const tabsTemplate = ensureElement<HTMLTemplateElement>('#tabs');
// const soldTemplate = ensureElement<HTMLTemplateElement>('#sold');
const orderTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppState({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
// const bids = new Basket(cloneTemplate(bidsTemplate), events);

const basket = new Basket(cloneTemplate(basketTemplate), events);

// const tabs = new Tabs(cloneTemplate(tabsTemplate), {
//     onClick: (name) => {
//         if (name === 'closed') events.emit('basket:open');
//         else events.emit('bids:open');
//     }
// });

const order = new Order(cloneTemplate(orderTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

// Изменились элементы каталога
events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.catalog.map(item => {
      // console.log(item);
        const card = new CatalogItem(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
          category: item.category,
          title: item.title,
          image: item.image,
          price: item.price
        });
    });

    page.counter = appData.getOrderedProducts().length;
});

// Отправлена форма заказа
// events.on('order:submit', () => {
//     api.orderProducts(appData.order)
//         .then((result) => {
//             const success = new Success(cloneTemplate(successTemplate), {
//                 onClick: () => {
//                     modal.close();
//                     appData.clearBasket();
//                     events.emit('basket:changed');
//                 }
//             });

//             modal.render({
//                 content: success.render({})
//             });
//         })
//         .catch(err => {
//             console.error(err);
//         });
// });

// Изменилось состояние валидации формы
// events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
//     const { email, phone } = errors;
//     order.valid = !email && !phone;
//     order.errors = Object.values({phone, email}).filter(i => !!i).join('; ');
// });

// Изменилось одно из полей
// events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: IOrderForm }) => {
//     appData.setOrderField(data.field, data.value);
// });

// Открыть форму заказа
// events.on('order:open', () => {
//     modal.render({
//         content: order.render({
//             phone: '',
//             email: '',
//             valid: false,
//             errors: []
//         })
//     });
// });

// Открыть активные лоты
// events.on('bids:open', () => {
//     modal.render({
//         content: createElement<HTMLElement>('div', {}, [
//             tabs.render({
//                 selected: 'active'
//             }),
//             bids.render()
//         ])
//     });
// });

// Открыть закрытые лоты
// events.on('basket:open', () => {
//     modal.render({
//         content: createElement<HTMLElement>('div', {}, [
//             basket.render()
//         ])
//     });
// });

// Изменения в лоте, но лучше все пересчитать
// events.on('basket:changed', () => {
    // page.counter = appData.getOrderedProducts().length;
    // bids.items = appData.getActiveLots().map(item => {
    //     const card = new BidItem(cloneTemplate(cardBasketTemplate), {
    //         onClick: () => events.emit('preview:changed', item)
    //     });
    //     return card.render({
    //         title: item.title,
    //         image: item.image,
    //         status: {
    //             amount: item.price,
    //             status: item.isMyBid
    //         }
    //     });
    // });
    // const total = 0;
    // basket.items = appData.getOrderedProducts().map(item => {
    //     const card = new BasketItem(cloneTemplate(cardBasketTemplate),
    //     {
    //         onClick: (event) => {
    //             const checkbox = event.target as HTMLInputElement;
    //             appData.toggleOrderedProduct(item.id, checkbox.checked);
    //             basket.total = appData.getTotal();
    //             basket.selected = appData.order.items;
    //         }
    //     }
    //     );
    //     return card.render({
    //       amount: item.amount,
    //       title: item.title,
    //       price: item.price,
    //     });
    // });
    // basket.selected = appData.order.items;
    // basket.total = total;
// })

// Открыть лот
events.on('card:select', (item: Product) => {
    appData.setPreview(item);
});

// Изменен открытый выбранный лот
events.on('preview:changed', (item: Product) => {
    const showItem = (item: Product) => {
        const card = new CardPreview(cloneTemplate(cardPreviewTemplate));
        // const auction = new CardPreview(cloneTemplate(cardPreviewTemplate), {
        //     onClick: (price) => {
        //         item.placeBid(price);
        //         auction.render({
        //             status: item.status,
        //             time: item.timeStatus,
        //             label: item.auctionStatus,
        //             nextBid: item.nextBid,
        //             history: item.history
        //         });
        //     }
        // });

        modal.render({
            content: card.render({
              category: item.category,
              title: item.title,
              description: item.description,
              image: item.image,
              price: item.price
            })
        });

    };

    if (item) {
        api.getProduct(item.id)
            .then((result) => {
                item.category = result.category;
                item.title = result.title;
                item.description = result.description;
                item.image = result.image;
                item.price = result.price;
                showItem(item);
            })
            .catch((err) => {
                console.error(err);
            })
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
api.getProductList()
    .then(appData.setCatalog.bind(appData))
    .catch(err => {
        console.error(err);
    });

