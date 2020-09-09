import { getUserAgent } from "./modules/getUserAgent";

/** @var {Object} ua ユーザーエージェント情報 */
export const ua = getUserAgent();

/** @var {Element} checkEl チェック用要素 */
export const checkEl = document.createElement("div");

/** @var {Element} html html */
export const html = document.documentElement;

/** @var {Element} body body */
export const body = document.body;

/** @var {Element} scrollable スクロール要素 */
export const scrollable =
  typeof document.scrollingElement !== "undefined"
    ? document.scrollingElement
    : document.documentElement;

/** @var {String} resizeリサイズ */
export const resize =
  typeof window.onorientationchange !== "undefined"
    ? "orientationchange"
    : "resize";

/**
 * IE判定
 * @return {Boolean}
 */
export function isIE() {
  return ua.browser.ie || ua.browser.ie11;
}

/**
 * スマホ判定
 * @return {Boolean}
 */
export function isSmartPhone() {
  return (
    ua.device.iPhone ||
    ua.device.iPod ||
    ua.device.androidPhone ||
    ua.device.windowsPhone ||
    ua.device.blackBerry ||
    ua.ua.indexOf("nexus 4") > -1 ||
    ua.ua.indexOf("nexus 5") > -1 ||
    ua.ua.indexOf("nexus 6") > -1
  );
}

/**
 * タブレット判定
 * @return {Boolean}
 */
export function isTablet() {
  return (
    ua.device.iPad ||
    ua.device.androidTablet ||
    (!isIE() && ua.ua.indexOf("tablet") > -1) ||
    (!isIE() && ua.ua.indexOf("windows") > -1 && ua.ua.indexOf("touch") > -1) ||
    ua.ua.indexOf("nexus 7") > -1 ||
    ua.ua.indexOf("nexus 9") > -1 ||
    ua.ua.indexOf("nexus 10") > -1
  );
}

/**
 * PC判定
 * @return {Boolean}
 */
export function isPC() {
  return !isSmartPhone() && !isTablet();
}

/**
 * PC以外判定
 * @return {Boolean}
 */
export function isSP() {
  return isSmartPhone() || isTablet();
}

/**
 * カレントURL取得
 * @return {URL}
 */
export function getCurrentUrl() {
  return window.location.href
    .replace(window.location.protocol + "//" + window.location.host, "")
    .replace(/\/+/g, "/");
}

/**
 * パスの取得
 * htmlに[data-root]or[data-assets]があればそれをセット、無ければデフォルトで / がルート
 * @return {String}
 */
export function getPath() {
  const root = html.getAttribute("data-root");
  const assets = html.getAttribute("data-assets");

  return {
    root: root || "/",
    assets: assets || "/assets/",
  };
}

/**
 * イベント発火
 * @param {String} event イベント名
 * @param {Object} $element 対象の要素
 */
export const triggerEvent = (event, $element) => {
  const e = document.createEvent("HTMLEvents");
  e.initEvent(event, true, true);
  $element.dispatchEvent(e);
};

/**
 * CSS で付与されている値を取得する
 * @param {Object} $element 調査する要素
 * @param {String} style スタイルのプロパティ名
 * @param {String} pseudo 疑似要素指定 :before or :after
 * @return {String} スタイルの値
 */
export const getStyle = ($element, style, pseudo) => {
  const element =
    typeof $element === "object" ? $element : document.querySelector($element);
  if (!element) {
    return false;
  }
  return getComputedStyle(element, pseudo)
    .getPropertyValue(style)
    .replace(/"/g, "")
    .trim();
};

/**
 * メディアクエリー情報
 * @return {Object}
 */
export function matchMedia() {
  const obj = {
    lg: 1024,
    md: 768,
    sm: 568,
    xs: 412,
    conditions: {},
    breakPoint: {},
  };

  // 条件リスト
  obj.conditions = {
    breakLg: `(max-width: ${obj.lg - 1}px)`,
    breakMd: `(max-width: ${obj.md - 1}px)`,
    breakSm: `(max-width: ${obj.sm - 1}px)`,
    breakXs: `(max-width: ${obj.xs - 1}px)`,
    overXs: `(min-width: ${obj.xs}px)`,
    overSm: `(min-width: ${obj.sm}px)`,
    overMd: `(min-width: ${obj.md}px)`,
    overLg: `(min-width: ${obj.lg}px)`,
    landscape: "(orientation: landscape)",
    portrait: "(orientation: portrait)",
  };

  // matchMediaを定義
  obj.breakPoint = {
    breakLg: window.matchMedia(obj.conditions.breakLg),
    breakMd: window.matchMedia(obj.conditions.breakMd),
    breakSm: window.matchMedia(obj.conditions.breakSm),
    breakXs: window.matchMedia(obj.conditions.breakXs),
    overXs: window.matchMedia(obj.conditions.overXs),
    overSm: window.matchMedia(obj.conditions.overSm),
    overMd: window.matchMedia(obj.conditions.overMd),
    overLg: window.matchMedia(obj.conditions.overLg),
    landscape: window.matchMedia(obj.conditions.landscape),
    portrait: window.matchMedia(obj.conditions.portrait),
  };

  return obj;
}

/**
 * ブレークポイントを判断
 * @param  {string} mediaName [breakLg, breakMd, breakSm, breakXs, overLg, overMd, overSm, overXs, landscape, portrait]
 * @return {boolean} true or false
 */
export function isMedia(mediaName) {
  const media = matchMedia();
  if (media.breakPoint[mediaName]) {
    return media.breakPoint[mediaName].matches;
  } else {
    return false;
  }
}

/**
 * メインに定義されたモジュールを管理します
 */
export class Module {
  /** @var {Array} MODULE_LIST モジュールリストを静的に保持します */
  static MODULE_LIST = [];

  /**
   * 登録されたモジュールを再処理します
   * @param {Object} options {
   *     @param {Array} include 指定したモジュール名だけを実行します
   *     @param {Array} exclude 指定したモジュール名を除外して実行します
   * }
   */
  static refresh = (options) => {
    const include =
      typeof options !== "undefined" && typeof options.include !== "undefined"
        ? options.include
        : [];
    const exclude =
      typeof options !== "undefined" && typeof options.exclude !== "undefined"
        ? options.exclude
        : [];

    Module.MODULE_LIST.forEach((instance) => {
      if (typeof instance.init === "function") {
        if (
          !include.length ||
          (include.length &&
            include.indexOf(instance.constructor.name) != -1 &&
            !exclude.length) ||
          (exclude.length && exclude.indexOf(instance.constructor.name) == -1)
        ) {
          instance.init();
        }
      }
    });
  };

  /**
   * モジュールを登録します
   * @param {Object} instance インスタンスオブジェクト
   */
  static register = (instance) => {
    Module.MODULE_LIST.push(new instance());
  };
}

// UA判定・処理
if (isSP()) ua.env.push('sp')
if (isSmartPhone()) ua.env.push('smartphone')
if (isTablet()) ua.env.push('tablet')
if (isPC()) ua.env.push('pc')

ua.env.forEach(className => {
  html.classList.add(className)
})
