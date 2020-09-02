// スライダー（siema）

import * as utils from '../utils'
import Siema from 'siema'

export default class Slider {
    /** @var {Object} obj スライダーオブジェクトを格納する */
    static obj: Object = {}

    constructor() {
        this.init()
        this.resize()
    }

    init() {
        this.mv()
        this.standard()
    }

    /**
     * リサイズ時の対応
     */
    resize() {
        window.addEventListener('resize', () => {
            for (const key in Slider.obj) {
                activeNav(Slider.obj[key])
            }
        }, false)
    }

    /**
     * スライダーオブジェクトから特定のスライドを取得する
     * @param {string} id data属性の値
     */
    getSlider(id: string) {
        return Slider.obj[id]
    }

    /**
     * メインビジュアル
     */
    mv() {
        const type = 'mv'
        const $sliders = document.querySelectorAll('[data-slider-' + type + ']:not(.on-slider)')
        Array.from($sliders).forEach($slider => {
            $slider.classList.add('on-slider')

            const mySiema = new Siema({
                selector: $slider,
                loop: true,
                onInit: Slider.onInit,
                onChange: Slider.onChange,
            })
            Slider.obj[type + '-' + $slider.getAttribute('data-slider-' + type)] = mySiema
        })
    }

    /**
     * 標準的スライダー
     */
    standard() {
        const type = 'standard'
        const $sliders = document.querySelectorAll('[data-slider-' + type + ']:not(.on-slider)')
        Array.from($sliders).forEach($slider => {
            // flex などのクラスを除去する
            let childrenClasses = ''
            if ($slider.className.indexOf('c-flex') != -1) {
                $slider.className = ''
                Array.from($slider.children).forEach($children => {
                    childrenClasses += $children.className + ', '
                    $children.className = ''
                })
            }

            $slider.classList.add('on-slider')

            const mySiema = new Siema({
                selector: $slider,
                perPage: (() => {
                    if (childrenClasses.indexOf('u-w-3') != -1) {
                        return {
                            0: 2,
                            600: 3,
                            960: 4
                        }
                    } else if (childrenClasses.indexOf('u-w-4') != -1) {
                        return {
                            0: 2,
                            600: 3
                        }
                    } else if (childrenClasses.indexOf('u-w-6') != -1) {
                        return 2
                    }
                    return 1
                })(),
                onInit: Slider.onInit,
                onChange: Slider.onChange,
            })
            Slider.obj[type + '-' + $slider.getAttribute('data-slider-' + type)] = mySiema
        })
    }

    /**
     * Siema 初期起動時
     */
    static onInit() {
        const mySiema = this

        addEventNav(mySiema)

        activeNav(mySiema)
    }

    /**
     * Siema スライドが切り替わった時
     */
    static onChange() {
        const mySiema = this

        activeNav(mySiema)
    }
}

/**
 * ID を取得する
 * @param {Siema} mySiema
 * @return {string} id data属性の値
 */
const getId = (mySiema: Siema) => {
    let id = '';
    for (const key in mySiema.selector.dataset) {
        if (key.indexOf('slider') != -1) {
            id = mySiema.selector.dataset[key]
        }
    }
    return id
}

/**
 * Type を取得する
 * @param {Siema} mySiema
 * @return {string} type data属性のファミリータイプ
 */
const getType = (mySiema: Siema) => {
    let type = '';
    for (const key in mySiema.selector.dataset) {
        if (key.indexOf('slider') != -1) {
            type = key.replace('slider', '').toLowerCase()
        }
    }
    return type
}

/**
 * 前へのボタン要素を取得する
 * @param {Siema} mySiema
 * @return {HTMLButtonElement} $prev 前へのボタン要素
 */
const getElementPrevNav = (mySiema: Siema) => {
    const id = getId(mySiema)
    const type = getType(mySiema)
    const $prev: HTMLButtonElement = document.querySelector('[data-slider-' + type + '-prev="' + id + '"]')
    return $prev
}

/**
 * 次へのボタン要素を取得する
 * @param {Siema} mySiema
 * @return {HTMLButtonElement} $next 次へのボタン要素
 */
const getElementNextNav = (mySiema: Siema) => {
    const id = getId(mySiema)
    const type = getType(mySiema)
    const $next: HTMLButtonElement = document.querySelector('[data-slider-' + type + '-next="' + id + '"]')
    return $next
}

/**
 * ナビ要素にイベントを付与する
 * @param {Siema} mySiema
 */
const addEventNav = (mySiema: Siema) => {
    const $prev = getElementPrevNav(mySiema)
    const $next = getElementNextNav(mySiema)
    if ($prev) $prev.addEventListener('click', () => mySiema.prev())
    if ($next) $next.addEventListener('click', () => mySiema.next())
}

/**
 * ナビ要素のアクティブ化を管理する
 * @param {Siema} mySiema
 */
const activeNav = (mySiema: Siema) => {
    const $prev = getElementPrevNav(mySiema)
    const $next = getElementNextNav(mySiema)
    if (!mySiema.config.loop) {
        if ($prev) $prev.disabled = 0 === mySiema.currentSlide ? true : false
        if ($next) $next.disabled = mySiema.innerElements.length - mySiema.perPage <= mySiema.currentSlide ? true : false
    }
}
