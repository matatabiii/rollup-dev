export function getUserAgent () {
  class UA {
    constructor () {
      // UA取得
      this.ua = navigator.userAgent.toLowerCase()

      // OS判定
      this.os = this.getOS()

      // デバイス判定
      this.device = this.getDevice()

      // ブラウザの判定
      this.browser = this.getBrowser()

      // その他
      this.other = this.getOther()

      // 環境
      this.env = []
      this.isTrueKey(this.env, this.os)
      this.isTrueKey(this.env, this.device)
      this.isTrueKey(this.env, this.browser)
      this.isTrueKey(this.env, this.other)
    }

    /**
     * OS判定
     */
    getOS () {
      const obj = {
        macOS: this.ua.indexOf('mac') > -1 && !(this.ua.indexOf('iphone') > -1 || this.ua.indexOf('ipad') > -1 || this.ua.indexOf('ipod') > -1),
        iOS: this.ua.indexOf('iphone') > -1 || this.ua.indexOf('ipad') > -1 || this.ua.indexOf('ipod') > -1,
        windows: this.ua.indexOf('win') > -1 && !(this.ua.indexOf('windows phone') > -1),
        android: this.ua.indexOf('android') > -1,
        windowsPhone: this.ua.indexOf('windows phone') > -1
      }
      return obj
    }

    /**
     * デバイス判定
     */
    getDevice () {
      const obj = {
        iPhone: this.ua.indexOf('iphone') > -1,
        iPad: this.ua.indexOf('ipad') > -1,
        iPod: this.ua.indexOf('ipod') > -1,
        android: this.os.android,
        androidPhone: this.os.android && this.ua.indexOf('mobile') > -1,
        androidTablet: this.os.android && this.ua.indexOf('tablet') > -1,
        windowsPhone: this.os.windowsPhone,
        blackBerry: this.ua.indexOf('blackberry') > -1,
        mac: this.os.macOS
      }

      return obj
    }

    /**
     * ブラウザの判定
     */
    getBrowser () {
      const obj = {
        firefox: this.ua.indexOf('firefox') > -1,
        opera: this.ua.indexOf('opera') > -1,
        chrome: this.ua.indexOf('chrome') > -1 && !(this.ua.indexOf('edge') > -1),
        edge: this.ua.indexOf('edge') > -1,
        ie11: this.ua.indexOf('trident/7') > -1,
        safari: this.ua.indexOf('safari') > -1 && !(this.ua.indexOf('chrome') > -1) && this.ua.indexOf('edge') > -1
      }

      obj.ie = this.ua.indexOf('msie') > -1 && !obj.opera

      return obj
    }

    /**
     * その他
     */
    getOther () {
      const obj = {
        googlebot: this.ua.indexOf('googlebot') > -1
      }

      return obj
    }

    /**
     * true の key のみ配列に格納
     */
    isTrueKey (array, obj) {
      for (const key of Object.keys(obj)) {
        if (obj[key]) {
          array.push(key.toLowerCase()) // 小文字に変換
        }
      }
    }
  }

  return new UA()
}
