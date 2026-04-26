export function openPage(url: string) {
  const tabPages = ['/pages/index/index', '/pages/me/me']
  if (tabPages.includes(url.split('?')[0])) {
    uni.switchTab({ url })
    return
  }

  uni.navigateTo({ url })
}

export function showInfoToast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

export function showSuccessToast(title: string) {
  uni.showToast({ title, icon: 'success' })
}
