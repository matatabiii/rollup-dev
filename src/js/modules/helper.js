/**
 * [WordPress]CF7の送信イベント処理を補助
 * @param {HtmlSelector} targetSelector ターゲットセレクター
 */
export function helperCF7 (targetSelector) {
  if (document.querySelector('[data-cf-agree]')) {
    const check = document.querySelector(
      '[data-cf-agree="check"] input[type="checkbox"]'
    )
    const submit = document.querySelector('[data-cf-agree="submit"]')
    const $submitBtn = submit.querySelector('[type="submit"]')

    const cfIsChecked = (checkElement) => {
      if (checkElement.checked) {
        // submit.style.display = ''
        submit.classList.remove('is-desabled')
        $submitBtn.removeAttribute('disabled')
      } else {
        // submit.style.display = 'none'
        submit.classList.add('is-desabled')
        $submitBtn.setAttribute('disabled', 'disabled')
      }
    }

    check.addEventListener('change', (e) => {
      cfIsChecked(e.currentTarget)
    })
    cfIsChecked(check)
  }
}

/**
 * 電話番号タップでトラッキング計測を可能にする
 * https://developers.google.com/analytics/devguides/collection/gtagjs/events?hl=ja
 */
export function gtagCallTracking () {
  if (document.querySelector('a[href^="tel:"]:not(.js-gtagCallTracking)')) {
    const $callAnchors = document.querySelectorAll(
      'a[href^="tel:"]:not(.js-gtagCallTracking)'
    )
    Array.prototype.forEach.call($callAnchors, ($tel) => {
      $tel.classList.add('js-gtagCallTracking')
      const number = $tel.getAttribute('href')
      const label =
        number +
        '（' +
        window.location.href
          .replace(window.location.protocol + '//' + window.location.host, '')
          .replace(/\/+/g, '/') +
        ')'
      // console.log(label)
      $tel.setAttribute(
        'onclick',
        "gtag('event', 'タップ', {'event_category': '電話番号', 'event_label': '" +
          label +
          "'})"
      )
    })
  }
}
