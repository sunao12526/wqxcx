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

function openProtocol(type: 1 | 2) {
  uni.navigateTo({ url: `/pages/user/protocol?type=${type}` })
}
</script>

<template>
  <view class="login-page">
    <wd-navbar custom-class="plain-navbar" safe-area-inset-top placeholder fixed :bordered="false" />

    <view class="login-container">
      <view class="brand">
        <image class="logo-image" src="/static/images/icon-logo.png" mode="aspectFit" />
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
          <image
            class="check-icon"
            :src="isAgreed ? '/static/images/icon-select-sel@2x.png' : '/static/images/icon-select-nor@2x.png'"
            mode="aspectFit"
          />
          <view class="agreement-text">
            我已阅读并同意
            <text class="agreement-link" @click.stop="openProtocol(1)">用户协议</text>
            和
            <text class="agreement-link" @click.stop="openProtocol(2)">隐私政策</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  box-sizing: border-box;
  height: 100vh;
  overflow: hidden;
  background: #fff;
}

.login-container {
  box-sizing: border-box;
  height: calc(100vh - 88rpx);
  padding: 110rpx 75rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-image {
  width: 240rpx;
  height: 240rpx;
}

.brand__name {
  margin-top: 32rpx;
  color: #202124;
  font-size: 44rpx;
  font-weight: 700;
}

.brand__desc {
  margin-top: 16rpx;
  color: #8b8277;
  font-size: 26rpx;
}

.action-area {
  margin-top: 220rpx;
  width: 100%;
}

:deep(.login-btn) {
  width: 100% !important;
  height: 80rpx !important;
  border: none !important;
  border-radius: 40rpx !important;
  background: #e54d2e !important;
  font-size: 32rpx !important;
  font-weight: 500 !important;
}

.agreement-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 40rpx;
}

.check-icon {
  width: 24rpx;
  height: 24rpx;
  flex-shrink: 0;
}

.agreement-text {
  color: #252525;
  font-size: 24rpx;
}

.agreement-link {
  color: #e54d2e;
}
</style>
