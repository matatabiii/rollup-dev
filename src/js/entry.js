import 'web-animations-js/web-animations-next.min.js'
import * as apps from './apps'
// import './modules/asyncSvgSprite' // SVGスプライト
import { helperCF7, gtagCallTracking } from './modules/helper'

// ヘルパー（CF7サポート, 電話番号トラッキングイベント付与）
helperCF7('[data-cf-agree]')
gtagCallTracking()
