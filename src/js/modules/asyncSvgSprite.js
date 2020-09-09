import { getPath } from '../apps'

const pash = getPath()

/**
 * SVGスプライトを非同期取得しbody直前に設置
 * @param {String} url ファイルまでのパス
 */
const asyncSvgSprite = async (url) => {
  try {
    const response = await fetch(url)
    document.body.insertAdjacentHTML('afterbegin', await response.text())
    document.documentElement.classList.add('use-svgSprite')
  } catch (err) {
    console.log('asyncSvgSprite', err)
  }
}

asyncSvgSprite(pash.assets + 'svg/sprite.svg')
