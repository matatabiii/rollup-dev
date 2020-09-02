// 文字列分解

import * as utils from '../utils'

export default class Parser {
    constructor() {
        this.init()
    }

    init() {
        const $parsers = document.querySelectorAll('.js-parser')
        Array.from($parsers).forEach($parser => {
            const texts = $parser.textContent.split('')
            let html = ''
            texts.forEach(text => {
                html += '<span>' + text + '</span>'
            });
            $parser.textContent = null
            $parser.insertAdjacentHTML('beforeend', html)
            $parser.classList.remove('js-parser')
        })
    }
}