import { getPath } from '../apps'

const pash = getPath()

/**
 * SVGスプライトを非同期取得しbody直前に設置
 * @param {String} url ファイルまでのパス
 */
const fetchSvgSprite = async (url) => {
  const response = await fetch(url)

  if (response.ok) {
    const text = await response.text()
    return text
  }

  throw new Error(response.status)
}

fetchSvgSprite(pash.assets + 'svg/sprite.svg').then(text => {
  document.body.insertAdjacentHTML('afterbegin', text)
  document.documentElement.classList.add('use-svgSprite')
}).catch(err => {
  console.log(err)
})
