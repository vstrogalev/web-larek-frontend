# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовыми классами
- src/components/common/ — папка с основными классами

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура
![UML scheme](uml.png)

### Реализация MVP
Приложение реализовано по MVP архитектуре и состоит из следующих основных частей:
1. Model - классы Model и его потомки Product и AppState
2. View - классы Component и его потомки Card, Basket, Form, Modal, Page, Success
3. Presenter - классы Api, его потомок LarekAPI, EventEmitter, а также код в src/index.ts

### Общее описание приложения, экранов и процесса
До отрисовки начального экрана приложение через класс LarekAPI запрашивает с сервера список товаров, передает их в AppState, которое формирует список товаров в модели и инициализирует событие 'catalog:changed'. Описание обработки данного события смотреть ниже.

Содается компонент Page, который содержит основные элементы основной страницы, а также вешает слушатель события клика по иконке корзины, который инициирует событие 'basket:open'

Событие 'catalog:changed' обрабатывается EventEmitter и запускает колбэк, который формирует карточки товара с помощью компонента Card. На карточке вешается слушатель события клика 'preview:changed'

Событие 'preview:changed' обрабатывается EventEmitter и запускает колбэк, который:
- если клик был по карточке,
  - то запрашивается товар с сервера по id, заполяются поля карточки
  - формируется карточка превью товара с помощью компонента Card. На карточке вешается слушатель события клика 'product:added'
  - запускается метод render компонента Modal с содержимым превью карточки
- иначе модельное окно закрывается

Событие 'product:added' обрабатывается EventEmitter и запускает колбэк, который:
- добавляет товар в массив товаров в корзине с помощью метода addProduct компонента AppState
- закрывает модальное окно
- инициирует событие 'basket:changed'

Событие 'basket:changed' обрабатывается EventEmitter и запускает колбэк, который:
- с помощью метода getOrderedProducts() класса AppState получает список товаров в корзине и на основе этого:
  - меняет количество товара на иконке корзины,
  - для каждого товара создает элемент BasketItem вешает на его кнопку удаления слушатель, который:
    - запускает метод deleteProduct класса AppState для удаления товара
    - обновляет общую сумму синапсов в корзине
  - подсчитывает общую сумму синапсов в корзине и отображает их
  - запускает отрисовку строки о товаре в корзине с помощью метода render класса Card

Событие 'basket:open' обрабатывается EventEmitter и запускает колбэк, который запускает метод render класса Component для модального окна класса Modal. Класс Basket в конструкторе вешает на кнопку Оформить событие 'delivery:open'

Событие 'delivery:open' обрабатывается EventEmitter и запускает колбэк, который запускает метод render с содержимым экземпляра класса Delivery. Конструктор класса вешает на контейнер, содержащий кнопки выбора способа оплаты слушатель клика после чего сразу инициируется событие `payment:changed`.
Так как класс Delivery является потомком класса Form, то конструктор родителя вешает на поля
- ввода данных обрабобтчик ввода в поле, который инициирует событие `${this.container.name}.${String(field)}:change`
- кнопку с ролью submit обработчик клика, который инициирует события `${this.container.name}:submit`

События 'order.address:change' (для формы с полем адреса), /^contacts\..*:change/ для формы ввода почты и телефона обрабатываются EventEmitter и выполняют колбэки, которые:
- вводят данные в поля объекта заказа AppState.order
- запускает validateDelivery() или validateContacts() для соответствующих форм, которые проверяют заполнение полей данными и если не все поля заполнены, то делают кнопку для прохода далее недоступной, и передают текст ошибки в события 'formDeliveryErrors:change' или 'formContactsErrors:change' для соответствующих форм.

События 'formDeliveryErrors:change' и 'formContactsErrors:change' для форм ввода формы оплаты или контактов, соответственно, обрабатываются EventEmitter и выполняют колбэк, который устанавливает поле заказа order.valid в true если все поля заполнены или false если нет и выводит на форму соответствующее сообщение об ошибке

Событие `order:submit`, происходящее от обработчика кнопки Далее формы ввода способа оплаты и адреса,  обрабатывается EventEmitter и запускает колбэк, который инициирует событие 'contacts:open'

Событие `contacts:submit`, происходящее от обработчика кнопки Оплатить формы ввода контактных данных, обрабатывается EventEmitter и запускает колбэк, который:
- выполняет метод completeOrder() класса AppState, который переносит данные из корзины в объект заказа
- передает на сервер заказ, получает ответ
- создает экземпляр класса Success передает в него итого синапсов
- вешает на кнопку "За новыми покупками!" обработчик события, который:
  - закрывает модальное окно
  - очищает корзину
  - убирает класс выбора способа оплаты
  - инициирует 'basket:changed'
- вызывает метод render


## Описание базовых классов их предназначение и функции
- Класс EventEmitter обеспечивает работу событий. Его функции: возможность установить и снять слушателей событий, вызвать слушателей при возникновении события, слушать все события, сбросить все обработчики
- Класс Api обеспечивает обмен с сервером. Его функции: реализация методов GET и POST, но в общем смысле, вне привязки к модели данных
- Класс LarekAPI, наследуется от Api и имплементирует интерфейс ILarekAPI. Его задача - реализовать обмен данными с сервером с учетом модели данных. Его функции: получить список товаров, получить карточку товара, отправить заказ
- Класс Component, базовый класс для визуализации компонентов приложения. От него наследуются все компоненты представления. Не содержит полей. Его функции: переключиить класс CSS, установить текст, установить/снять состояние Disabled, сделать элемент видимым, сделать элемент скрытым, установить картинку для элемента, отрисовать (render) элемент на странице.
- Класс Model, базовый класс для классов бизнес-модели. От него наследуются классы Product и AppState. Конструктор принимает экземпляр класса EventEmitter и содержит метод-обертку emitChanges для возможности вызвать событие из компонента модели.

## Компоненты представления

- Классы Card, Basket, Form, Modal, Page, Success - классы-наследники класса Component. Предназначены для визуализации соответствующих компонент приложения. В каждом из них реализуется следующий подход:
  - в конструктор принимается HTML элемент, определяющий контейнер для данного компонента, а также объект events (опционально), позволяющий инициализировать событие в EventEmitter из компонента визуализации для дальнейшей обработки,
  - определяются закрытые поля, соответствующие элементам, составляющим компонент, которые должны отображать информацию из модели, реагировать на события от пользователя или принимать данные пользователя;
  - в конструкторе реализуются следующие задачи:
    - вызывается super;
    - по селекторам CSS в контейнере определяются внутренние элементы и сохраняются в закрытие поля;
    - при необходимости навешиваются обработчики событий на элементы;
  - под каждый элемент визуализации определяются сеттеры/геттеры
  - при необходимости перегружается метод render для реализации особенных возможностей визуализации данного компонента

## Компоненты модели данных (бизнес-логика)

- Класс AppState, наследник класса Model. Его задача - хранение данных модели, а также реализация методов изменения данных и инициализация событий для визуализации после изменения данных. Его функции:
  - добавить товар в корзину;
  - удалить товар из корзины;
  - очистить корзину;
  - определить сумму заказа;
  - сформировать массив объектов, содержащих данные карточек товара;
  - проверить, содержится ли товар в корзине;
  - получить список товаров в корзине;
  - завершить заказ - перенести в заказ данные из корзины;
  - установить вид оплаты;
  - установить адрес;
  - валидировать доставку;
  - установить поля контактов;
  - валидировать поля контактов;
- Класс Product, наследник класса Model. Его задача - имплементация интерфейса IProduct структуры карточки товара. Не содержит методов, а только поля карточки товара.


## Ключевые типы данных
```
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
  // payment: PaymentMethod;
	address: string;
}

// типизация полей формы ввода формы оплаты и адреса
export interface IDeliveryForm {
	payment: PaymentMethod;
	address: string;
}

// расширение типов форм до данных заказа
export type IOrder = IContactForm & {
		items: Id[];
    payment: PaymentMethod;
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
```



Ссылка на репозиторий https://github.com/vstrogalev/web-larek-frontend