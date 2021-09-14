const context = chrome

class Style {
  styleElement
  initialize() {
    this.styleElement = document.createElement('style')
    document.head.appendChild(this.styleElement)
  }
  addCSSRule(selector, rules) {
    const sheet = this.styleElement.sheet
    if ('insertRule' in sheet) {
      sheet.insertRule(`${selector} { ${rules} }`, sheet.cssRules.length);
    } else if ('addRule' in sheet) {
      sheet.addRule(selector, rules, sheet.cssRules.length);
    }
  }
  removeStyle() {
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
  }
}

function main() {
  const style = new Style()
  style.initialize()
  let hasInserted = false

  function disableRecommendation() {
    if (!style.styleElement) {
      style.initialize()
    }
    if (hasInserted) {
      return
    }
    style.addCSSRule('ytd-browse', 'visibility: hidden !important;')
    style.addCSSRule('tp-yt-app-drawer', 'visibility: hidden  !important;')
    style.addCSSRule('#secondary', 'visibility: hidden  !important;')
    style.addCSSRule('#end', 'visibility: hidden  !important;')
    hasInserted = true
  }

  function enableRecommendation() {
    style.removeStyle()
    hasInserted = false
  }

  context.runtime.sendMessage('is-enabled', (isEnabled) => {
    if (isEnabled) {
      disableRecommendation()
    }
  })
  context.runtime.onMessage.addListener((message) => {
    if (message === 'disable-extension') {
      enableRecommendation()
      return
    }
    if (message === 'enable-extension') {
      disableRecommendation()
      return
    }
  })
}

main()
