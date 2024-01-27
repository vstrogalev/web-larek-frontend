/**
 * Базовый компонент
 */
export class Component<T> {
    protected constructor(protected readonly container: HTMLElement) {
        // Учитывайте что код в конструкторе исполняется ДО всех объявлений в дочернем классе
    }

    // Инструментарий для работы с DOM в дочерних компонентах

    /**
     * Переключить класс
     */
    toggleClass(element: HTMLElement, className: string, force?: boolean): void {
        element.classList.toggle(className, force);
    }

    /**
     * Установить текстовое содержимое
     */
    protected setText(element: HTMLElement, value: unknown): void {
        if (element) {
            element.textContent = String(value);
        }
    }

    /**
    * Сменить статус блокировки
    */
    setDisabled(element: HTMLElement, state: boolean): void {
        if (element) {
            if (state) element.setAttribute('disabled', 'disabled');
            else element.removeAttribute('disabled');
        }
    }

    /**
     * Скрыть
     */
    protected setHidden(element: HTMLElement): void {
        element.style.display = 'none';
    }

    /**
     * Показать
     */
    protected setVisible(element: HTMLElement): void {
        element.style.removeProperty('display');
    }

    /**
     * Установить изображение с алтернативным текстом
     */
    protected setImage(element: HTMLImageElement, src: string, alt?: string): void {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            }
        }
    }

    /**
     * Вернуть корневой DOM-элемент
     */
    render(data?: Partial<T>): HTMLElement {
        Object.assign(this as object, data ?? {});
        return this.container;
    }
}
