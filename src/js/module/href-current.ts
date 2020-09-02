// a[href] カレント表記

import * as utils from '../utils'

export default class HrefCurrent {
    urlOriginal: string
    urlLessPara: any
    constructor() {
        this.init()
    }

    init() {
        this.urlOriginal = location.href.replace(location.protocol + '//' + location.host, '').replace(/\/+/g, '/')
        this.urlLessPara = this.urlOriginal.replace(location.search, '')

        const $anchors = document.querySelectorAll('a[href]:not([href^="#"])')
        Array.from($anchors).forEach($anchor => {
            this.toggleCurrent($anchor)
        })
    }

    /**
     * カレントを交互に切り換える
     * e.g. data-href-current='{"href": "", "contains": ""}'
     * @param {object} $element 要素
     */
    toggleCurrent($element) {
        let found = false
        const data = typeof $element.dataset.hrefCurrent !== 'undefined' ? JSON.parse($element.dataset.hrefCurrent) : {}

        // href 属性を取得 ( data.href の指定があればそちらを優先 )
        const href = typeof data.href === 'string' && data.href !== '' ?
            data.href.replace(location.protocol + '//' + location.host, '').replace(/\/+/g, '/') :
            typeof $element.href !== 'undefined' ? $element.href.replace(location.protocol + '//' + location.host, '').replace(/\/+/g, '/') : ''

        // 含み検索をするかを指定 ( data.contains / 文字列で指定がなければ href を参照する、指定があればそちらを優先 / 標準は無効 )
        const contains = typeof data.contains !== 'undefined' ? data.contains : false
        const containsHref = contains ?
            (typeof contains === 'string' && contains !== '' ? contains : href).replace(location.protocol + '//' + location.host, '').replace(/\/+/g, '/') :
            href

        if (this.urlOriginal === href || (contains && this.urlOriginal.indexOf(containsHref) != -1)) {
            this.isCurrent($element)
            found = true
        } else {
            this.notCurrent($element)
        }

        // 見つからなければ、パラメータを抜いた URL も検証する
        if (!found) {
            if (this.urlLessPara === href || (contains && this.urlLessPara.indexOf(containsHref) != -1)) {
                this.isCurrent($element)
            } else {
                this.notCurrent($element)
            }
        }
    }

    /**
     * カレント状態
     * @param {object} $element 要素
     */
    isCurrent($element) {
        // 既に .is-current を持っていれば付与しない
        if (!$element.classList.contains('is-current')) {
            $element.classList.add('is-current')
        }
    }

    /**
     * カレントではない状態
     * @param {object} $element 要素
     */
    notCurrent($element) {
        if (!this.hasIdParentElement($element, 'barba-wrapper')) {
            $element.classList.remove('is-current')
        }
    }

    /**
     * 特定のID値を持つ親要素があるか
     * @param  {object}  $element
     * @param  {string}  idName
     * @return {boolean}
     */
    hasIdParentElement($element, idName) {
        if ($element && $element.id === idName) {
            return true
        } else if ($element && typeof $element.parentNode !== 'undefined') {
            return this.hasIdParentElement($element.parentNode, idName)
        }
        return false
    }
}
