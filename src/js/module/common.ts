import * as utils from "../utils"
import axios from "axios"

utils.uaDevice(true)
utils.uaOs(true)
utils.uaBrowser(true)

// import icon from './../../svg/symbol-defs.svg'
const iconPath = document.documentElement.dataset.themeDist + '/svg/symbol-defs.svg'

if (iconPath.indexOf('//:') == -1) {
    axios.get(iconPath)
    .then(response => {
        document.body.insertAdjacentHTML('afterbegin', response.data)
    }).catch(err => {
        console.error(err)
    })
}
