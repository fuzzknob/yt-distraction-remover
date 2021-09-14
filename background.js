const context = chrome
const LOCAL_STORAGE_KEY = 'EXTENSION-ENABLED'

let isExtensionActive = null

function isExtensionEnabled() {
  if (isExtensionActive != null) {
    return isExtensionActive
  }
  let item = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (item == null) {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true')
    item = 'true'
  }
  isExtensionActive = item === 'true'
  return isExtensionActive
}

function toggleExtension() {
  const isEnabled = isExtensionEnabled()
  localStorage.setItem(LOCAL_STORAGE_KEY, !isEnabled)
  isExtensionActive = !isEnabled
}

function syncIcon() {
  const isEnabled = isExtensionEnabled()
  const iconPath = isEnabled ? 'assets/inverted.png': 'assets/logo.png'
  context.browserAction.setIcon({
    path: iconPath,
  })
}

function sendMessageToTabs(message) {
  context.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      const matches = tab.url.match(/^https:\/\/www\.youtube\.com/gm)
      if (matches && matches.length) {
        context.tabs.sendMessage(tab.id, message)
      }
    })
  })
}

function main() {
  syncIcon()
  context.browserAction.onClicked.addListener(() => {
    toggleExtension()
    syncIcon()
    const isEnabled = isExtensionEnabled()
    if (isEnabled) {
      sendMessageToTabs('enable-extension')
    } else {
      sendMessageToTabs('disable-extension')
    }
  })
  context.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'is-enabled') {
      const isEnabled = isExtensionEnabled()
      sendResponse(isEnabled)
    }
  })
}

main()
