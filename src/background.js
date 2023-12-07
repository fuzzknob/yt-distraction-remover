const context = globalThis.browser || globalThis.chrome
const action = context.browserAction || context.action
const LOCAL_STORAGE_KEY = 'EXTENSION-ENABLED'

async function getStorageItem(key) {
  const res = await context.storage.local.get([key])
  return res[key]
}

function setStorageItem(key, value) {
  return context.storage.local.set({[key]: value})
}

async function isExtensionEnabled() {
  let isExtensionActive = await getStorageItem(LOCAL_STORAGE_KEY)
  if (isExtensionActive == null) {
    await setStorageItem(LOCAL_STORAGE_KEY, true)
    isExtensionActive = 'true'
  }
  return isExtensionActive
}

async function toggleExtension() {
  const isEnabled = await isExtensionEnabled()
  await setStorageItem(LOCAL_STORAGE_KEY, !isEnabled)
}

async function syncIcon() {
  const isEnabled = await isExtensionEnabled()
  const iconPath = isEnabled ? 'assets/inverted.png': 'assets/logo.png'
  action.setIcon({
    path: iconPath,
  })
}

function sendMessageToAllTabs(message) {
  context.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      const matches = tab.url.match(/^https:\/\/www\.youtube\.com/gm)
      if (matches && matches.length) {
        context.tabs.sendMessage(tab.id, message)
      }
    })
  })
}

action.onClicked.addListener(async () => {
  await toggleExtension()
  await syncIcon()
  const isEnabled = await isExtensionEnabled()
  if (isEnabled) {
    sendMessageToAllTabs('enable-extension')
  } else {
    sendMessageToAllTabs('disable-extension')
  }
})

context.runtime.onMessage.addListener(async (message, sender) => {
  if (message === 'tab-init') {
    const isEnabled = await isExtensionEnabled()
    if (isEnabled) {
      context.tabs.sendMessage(sender.tab.id, 'enable-extension')
    }
  }
})

syncIcon()

