<script lang="ts" setup>
import { useTokenStore } from '@/store'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '登录',
  },
})

const isAgreed = ref(false)
const isSubmitting = ref(false)
const redirect = ref('')
const tokenStore = useTokenStore()

onLoad((options) => {
  redirect.value = typeof options?.redirect === 'string' ? decodeURIComponent(options.redirect) : ''
})

function afterLoginNavigate() {
  if (redirect.value) {
    uni.reLaunch({ url: redirect.value })
    return
  }

  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
    return
  }

  uni.switchTab({ url: '/pages/me/me' })
}

async function handleQuickLogin() {
  if (!isAgreed.value) {
    uni.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
    return
  }

  if (isSubmitting.value) {
    return
  }

  isSubmitting.value = true
  try {
    await tokenStore.wxLogin()
    afterLoginNavigate()
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <view class="login-page">
    <wd-navbar title="登录" custom-class="plain-navbar" safe-area-inset-top placeholder fixed :bordered="false" />

    <view class="brand">
      <view class="brand__mark">
        WQ
      </view>
      <view class="brand__name">
        品人家居
      </view>
      <view class="brand__desc">
        微信快捷登录后查看商品与订单
      </view>
    </view>

    <view class="action-area">
      <wd-button block custom-class="login-btn" :loading="isSubmitting" @click="handleQuickLogin">
        微信快捷登录
      </wd-button>

      <view class="agreement-row" @click="isAgreed = !isAgreed">
        <wd-checkbox :model-value="isAgreed" shape="square" checked-color="#e54d2e" />
        <view class="agreement-text">
          我已阅读并同意用户协议和隐私政策
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  padding: 72rpx 64rpx 64rpx;
  background: #fffaf7;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168rpx;
  height: 168rpx;
  border-radius: 50%;
  background: #202124;
  color: #ffdfb0;
  font-size: 44rpx;
  font-weight: 700;
}

.brand__name {
  margin-top: 36rpx;
  color: #202124;
  font-size: 44rpx;
  font-weight: 700;
}

.brand__desc {
  margin-top: 16rpx;
  color: #7b6f68;
  font-size: 26rpx;
}

.action-area {
  margin-top: 240rpx;
}

:deep(.login-btn) {
  height: 88rpx !important;
  border: none !important;
  border-radius: 44rpx !important;
  background: #e54d2e !important;
  font-size: 32rpx !important;
  font-weight: 600 !important;
}

.agreement-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 36rpx;
}

.agreement-text {
  color: #6b625d;
  font-size: 24rpx;
}
</style>
