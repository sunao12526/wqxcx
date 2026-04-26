<script lang="ts" setup>
import type { OrderSummary } from '@/api/types/app'
import { getMyOrders } from '@/api/order'
import { useTokenStore, useUserStore } from '@/store'
import { openPage } from '@/utils/app'
import { tabBarHeight } from '@/utils/systemInfo'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '我的',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()
const loading = ref(false)
const orders = ref<OrderSummary[]>([])
const pageStyle = computed(() => ({
  '--tab-bar-height': `${tabBarHeight}px`,
}))
const hasLogin = computed(() => tokenStore.updateNowTime().hasLogin)
const userInfo = computed(() => userStore.userInfo)
const orderStats = computed(() => {
  const pending = orders.value.filter(item => item.status === 'PENDING').length
  const followed = orders.value.filter(item => item.status === 'FOLLOWED_UP').length
  const closed = orders.value.filter(item => item.status === 'CLOSED').length
  return [
    { status: '', title: '全部订单', count: orders.value.length },
    { status: 'PENDING', title: '待处理', count: pending },
    { status: 'FOLLOWED_UP', title: '已跟进', count: followed },
    { status: 'CLOSED', title: '已关闭', count: closed },
  ]
})

async function loadMe() {
  if (!hasLogin.value) {
    return
  }

  loading.value = true
  try {
    await userStore.fetchUserInfo()
    const orderRes = await getMyOrders({ _start: 0, _end: 100 })
    orders.value = orderRes.data
  }
  finally {
    loading.value = false
  }
}

function openOrders(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : ''
  openPage(`/pages/user/orders${query}`)
}

async function logout() {
  await tokenStore.logout()
  orders.value = []
}

onShow(() => {
  void loadMe()
})
</script>

<template>
  <scroll-view scroll-y class="page" :style="pageStyle">
    <wd-navbar title="我的" custom-class="app-navbar" safe-area-inset-top placeholder fixed :bordered="false" />

    <view class="hero">
      <view class="hero__brand">
        品人家居
      </view>
    </view>

    <view class="content">
      <view v-if="!hasLogin" class="login-card">
        <image class="login-card__avatar" src="/static/images/default-avatar.png" mode="aspectFill" />
        <view class="login-card__main">
          <view class="login-card__title">
            暂未登录
          </view>
          <view class="login-card__desc">
            登录后查看订单和个人信息
          </view>
        </view>
        <wd-button custom-class="login-card__btn" @click="openPage('/pages/user/login')">
          登录
        </wd-button>
      </view>

      <template v-else>
        <view class="profile-card">
          <image class="profile-card__avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill" />
          <view class="profile-card__main">
            <view class="profile-card__name">
              {{ userInfo.nickname || userInfo.username || '微信用户' }}
            </view>
            <view class="profile-card__desc">
              {{ userInfo.phoneNumber || '欢迎回来' }}
            </view>
          </view>
        </view>

        <view class="section">
          <view class="section__head">
            <text>我的订单</text>
            <view class="section__link" @click="openOrders()">
              查看全部
              <wd-icon name="arrow-right" size="13px" />
            </view>
          </view>
          <view class="order-grid">
            <view v-for="item in orderStats" :key="item.title" class="order-stat" @click="openOrders(item.status)">
              <view class="order-stat__num">
                {{ item.count }}
              </view>
              <view class="order-stat__title">
                {{ item.title }}
              </view>
            </view>
          </view>
        </view>

        <view class="section menu">
          <view class="menu-item" @click="openPage('/pages/user/favorite')">
            <image class="menu-item__image" src="/static/images/icon-collection@2x.png" mode="aspectFit" />
            <text>我的收藏</text>
            <wd-icon name="arrow-right" size="18px" color="#8f837a" />
          </view>
          <view class="menu-item" @click="openPage('/pages/user/orders')">
            <wd-icon name="list" size="20px" color="#202124" />
            <text>订单记录</text>
            <wd-icon name="arrow-right" size="18px" color="#8f837a" />
          </view>
          <view class="menu-item" @click="openPage('/pages/goods/list')">
            <wd-icon name="goods" size="20px" color="#202124" />
            <text>继续选购</text>
            <wd-icon name="arrow-right" size="18px" color="#8f837a" />
          </view>
          <view class="menu-item" @click="logout">
            <wd-icon name="logout" size="20px" color="#202124" />
            <text>退出登录</text>
            <wd-icon name="arrow-right" size="18px" color="#8f837a" />
          </view>
        </view>

        <view v-if="loading" class="loading">
          同步中...
        </view>
      </template>
    </view>
  </scroll-view>
</template>

<style lang="scss" scoped>
.page {
  height: calc(100vh - var(--tab-bar-height, 50px));
  background: #f7f3ee;
}

.hero {
  height: 360rpx;
  padding: 32rpx 32rpx 0;
  background: #202124;
  color: #ffdfb0;
}

:deep(.app-navbar .wd-navbar__wrapper) {
  background: #202124;
}

:deep(.app-navbar .wd-navbar__title) {
  color: #ffdfb0;
  font-weight: 700;
}

.hero__brand {
  font-size: 44rpx;
  font-weight: 700;
}

.content {
  margin-top: -120rpx;
  padding: 0 24rpx 40rpx;
}

.login-card,
.profile-card,
.section {
  background: #fff;
  border-radius: 8rpx;
}

.login-card,
.profile-card {
  display: flex;
  align-items: center;
  padding: 28rpx;
}

.login-card__avatar,
.profile-card__avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #eee;
}

.login-card__main,
.profile-card__main {
  flex: 1;
  min-width: 0;
  margin-left: 20rpx;
}

.login-card__title,
.profile-card__name {
  color: #202124;
  font-size: 32rpx;
  font-weight: 700;
}

.login-card__desc,
.profile-card__desc {
  margin-top: 8rpx;
  color: #8f837a;
  font-size: 24rpx;
}

:deep(.login-card__btn) {
  width: 136rpx !important;
  height: 64rpx !important;
  border: none !important;
  border-radius: 32rpx !important;
  background: #e54d2e !important;
}

.section {
  margin-top: 20rpx;
  padding: 28rpx;
}

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #202124;
  font-size: 30rpx;
  font-weight: 700;
}

.section__link {
  display: flex;
  align-items: center;
  color: #8f837a;
  font-size: 24rpx;
  font-weight: 400;
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;
  margin-top: 28rpx;
}

.order-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-stat__num {
  color: #202124;
  font-size: 34rpx;
  font-weight: 700;
}

.order-stat__title {
  margin-top: 8rpx;
  color: #7b6f68;
  font-size: 24rpx;
}

.menu {
  padding: 0 28rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  height: 104rpx;
  border-bottom: 1rpx solid #f0ebe6;
  color: #202124;
  font-size: 28rpx;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item text {
  flex: 1;
  margin-left: 18rpx;
}

.menu-item__image {
  width: 40rpx;
  height: 40rpx;
}

.loading {
  margin-top: 24rpx;
  color: #8f837a;
  font-size: 24rpx;
  text-align: center;
}
</style>
