import './support-older-browsers.ts'

import * as utils from './utils'

// import './module/barba'
import './module/common'

import ClickBlur from './module/click-blur'
import HrefCurrent from './module/href-current'
import Parser from './module/parser'
import Scrollbar from './module/scrollbar'
import Slider from './module/slider'

utils.Module.register(ClickBlur)
utils.Module.register(HrefCurrent)
utils.Module.register(Parser)
utils.Module.register(Scrollbar)
utils.Module.register(Slider)
