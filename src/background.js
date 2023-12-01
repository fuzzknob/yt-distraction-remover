const context = chrome
const LOCAL_STORAGE_KEY = 'EXTENSION-ENABLED'

let isExtensionActive = null

async function getStorageItem(key) {
  const res = await chrome.storage.local.get([key])
  return res[key]
}

function setStorageItem(key, value) {
  return chrome.storage.local.set({[key]: value})
}

async function isExtensionEnabled() {
  if (isExtensionActive != null) {
    return isExtensionActive
  }
  let item = await getStorageItem(LOCAL_STORAGE_KEY)
  if (item == null) {
    await setStorageItem(LOCAL_STORAGE_KEY, true)
    item = 'true'
  }
  isExtensionActive = item === 'true'
  return isExtensionActive
}

async function toggleExtension() {
  const isEnabled = await isExtensionEnabled()
  await setStorageItem(LOCAL_STORAGE_KEY, !isEnabled)
  isExtensionActive = !isEnabled
}

async function syncIcon() {
  const isEnabled = await isExtensionEnabled()
  const iconPath = isEnabled ? 'assets/inverted.png': 'assets/logo.png'
  context.action.setIcon({
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

async function main() {
  await syncIcon()
  context.action.onClicked.addListener(async () => {
    await toggleExtension()
    await syncIcon()
    const isEnabled = await isExtensionEnabled()
    if (isEnabled) {
      sendMessageToTabs('enable-extension')
    } else {
      sendMessageToTabs('disable-extension')
    }
  })
  context.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message === 'is-enabled') {
      const isEnabled = await isExtensionEnabled()
      sendResponse(isEnabled)
    }
  })
}

main()
