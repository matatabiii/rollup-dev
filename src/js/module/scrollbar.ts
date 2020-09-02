// パージェクトスクロールバー

import * as utils from '../utils'
import PerfectScrollbar from 'perfect-scrollbar'

export default class Scrollbar {
    constructor() {
        this.init()
    }

    init() {
        const $scrolls = document.querySelectorAll('.js-ps, .js-ps-x, .js-ps-y')
        Array.from($scrolls).forEach($scroll => {
            const ps = new PerfectScrollbar($scroll, {
                suppressScrollY: $scroll.classList.contains('js-ps-x') ? true : false,
                suppressScrollX: $scroll.classList.contains('js-ps-y') ? true : false,

                useBothWheelAxes: true,
            })
            $scroll.classList.remove('js-ps')
            $scroll.classList.remove('js-ps-x')
            $scroll.classList.remove('js-ps-y')
        })
    }
}
