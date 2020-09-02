// 汎用機能を定義するファイル

/**
 * ユーザーエージェントによる閲覧デバイスの判定
 * @param {Boolean} isToggleClassName 判定結果をルート要素に付与するかの指定
 * @return {String} 閲覧デバイス名
 */
export const uaDevice = isToggleClassName => {
    const ua = window.navigator.userAgent.toLowerCase()
    let device = ''
    if (ua.indexOf('mobile') != -1 ||
        ua.indexOf('iphone') != -1 ||
        ua.indexOf('ipod') != -1 ||
        ua.indexOf('ipad') != -1 ||
        ua.indexOf('android') != -1) {
        device = 'sp'
    } else {
        device = 'pc'
    }
    if (isToggleClassName) {
        const htmlClassList = document.documentElement.classList
        htmlClassList.remove('sp')
        htmlClassList.remove('pc')
        if (device !== '') {
            htmlClassList.add(device)
        }
    }
    return device
}

/**
 * ユーザーエージェントによる閲覧 OS の判定
 * @param {Boolean} isToggleClassName 判定結果をルート要素に付与するかの指定
 * @return {String} 閲覧 OS 名
 */
export const uaOs = isToggleClassName => {
    const ua = window.navigator.userAgent.toLowerCase()
    let os = ''
    if (ua.indexOf('windows') != -1) {
        os = 'windows'
    } else if (ua.indexOf('iphone') != -1 ||
        ua.indexOf('ipod') != -1 ||
        ua.indexOf('ipad') != -1) {
        os = 'ios'
    } else if (ua.indexOf('mac') != -1) {
        os = 'mac'
    } else if (ua.indexOf('android') != -1) {
        os = 'android'
    }
    if (isToggleClassName) {
        const htmlClassList = document.documentElement.classList
        htmlClassList.remove('windows')
        htmlClassList.remove('ios')
        htmlClassList.remove('mac')
        htmlClassList.remove('android')
        if (os !== '') {
            htmlClassList.add(os)
        }
    }
    return os
}

/**
 * ユーザーエージェントによる閲覧ブラウザーの判定
 * @param {Boolean} isToggleClassName 判定結果をルート要素に付与するかの指定
 * @return {String} 閲覧ブラウザー名
 */
export const uaBrowser = isToggleClassName => {
    const ua = window.navigator.userAgent.toLowerCase()
    let browser = ''
    if (ua.indexOf('safari') != -1 && ua.indexOf('chrome') == -1) {
        browser = 'safari'
    } else if (ua.indexOf('msie') != -1 || (ua.indexOf('trident') != -1 && ua.indexOf('rv:11') != -1)) {
        browser = 'ie'
    }
    if (isToggleClassName) {
        const htmlClassList = document.documentElement.classList
        htmlClassList.remove('safari')
        htmlClassList.remove('ie')
        if (browser !== '') {
            htmlClassList.add(browser)
        }
    }
    return browser
}

/**
 * イベント発火
 * @param {String} event イベント名
 * @param {Object} $element 対象の要素
 */
export const triggerEvent = (event, $element) => {
    const e = document.createEvent('HTMLEvents')
    e.initEvent(event, true, true)
    $element.dispatchEvent(e)
}

/**
 * CSS で付与されている値を取得する
 * @param {Object} $element 調査する要素
 * @param {String} style スタイルのプロパティ名
 * @param {String} pseudo 疑似要素指定 :before or :after
 * @return {String} スタイルの値
 */
export const getStyle = ($element, style, pseudo) => {
    const $_element = typeof $element === 'object' ? $element : document.querySelector($element)
    if (!$_element) {
        return false
    }
    return getComputedStyle($_element, pseudo).getPropertyValue(style).replace(/"/g, '').trim()
}

/**
 * 全角を半角2文字カウントする文字数を取得する
 * @param {String} str 数える文字数
 * @return {Number}
 */
export const getSize = str => {
    let result = 0
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i)
        if ((chr >= 0x00 && chr < 0x81) ||
            (chr === 0xf8f0) ||
            (chr >= 0xff61 && chr < 0xffa0) ||
            (chr >= 0xf8f1 && chr < 0xf8f4)
        ) {
            result += 1
        } else {
            result += 2
        }
    }
    return result
}

/** @var {String} resizeリサイズ */
export const resize = typeof window.onorientationchange !== 'undefined' ? 'orientationchange' : 'resize'

/** @var {Element} scrollable スクロール要素 */
export const scrollable = document.scrollingElement || document.documentElement

/**
 * メインに定義されたモジュールを管理します
 */
export class Module {
    /** @var {Array} MODULE_LIST モジュールリストを静的に保持します */
    static MODULE_LIST = []

    /**
     * 登録されたモジュールを再処理します
     * @param {Object} options {
     *     @param {Array} include 指定したモジュール名だけを実行します
     *     @param {Array} exclude 指定したモジュール名を除外して実行します
     * }
     */
    static refresh = (options) => {
        const include = typeof options !== 'undefined' && typeof options.include !== 'undefined' ? options.include : []
        const exclude = typeof options !== 'undefined' && typeof options.exclude !== 'undefined' ? options.exclude : []

        Module.MODULE_LIST.forEach(instance => {
            if (typeof instance.init === 'function') {
                if (!include.length || include.length && include.indexOf(instance.constructor.name) != -1 &&
                    !exclude.length || exclude.length && exclude.indexOf(instance.constructor.name) == -1
                ) {
                    instance.init()
                }
            }
        })
    }

    /**
     * モジュールを登録します
     * @param {Object} instance インスタンスオブジェクト
     */
    static register = instance => {
        Module.MODULE_LIST.push(new instance())
    }
}
