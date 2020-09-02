// クリック時にフォーカスを外す

import * as utils from '../utils'

interface HTMLElementEvent<T extends HTMLElement> extends Event {
  currentTarget: T;
}

export default class ClickBlur {
    constructor() {
        this.init()
    }

    init() {
        const $targets = document.querySelectorAll('a:not(.no-click-blur), button:not(.no-click-blur), label:not(.no-click-blur)')
        Array.from($targets).forEach($target => {
            $target.addEventListener('click', (e: HTMLElementEvent<HTMLInputElement>) => e.currentTarget.blur(), false)
        })
    }
}
