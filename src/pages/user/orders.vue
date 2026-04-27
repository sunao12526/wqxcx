<script lang="ts" setup>
import type { OrderStatus, OrderSummary } from '@/api/types/app'
import { getMyOrders } from '@/api/order'
import { openPage } from '@/utils/app'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '我的订单',
  },
})

type OrderTabName = 'ALL' | OrderStatus

const PAGE_SIZE = 10

const activeTab = ref<OrderTabName>('ALL')
const orders = ref<OrderSummary[]>([])
const total = ref(0)
const pageStart = ref(0)
const initialLoading = ref(true)
const refreshing = ref(false)
const loadingMore = ref(false)
const loadMoreError = ref(false)
const initialError = ref(false)
const pageReady = ref(false)

const tabs: Array<{ name: OrderTabName, title: string }> = [
  { name: 'ALL', title: '全部' },
  { name: 'PENDING', title: '待处理' },
  { name: 'FOLLOWED_UP', title: '已跟进' },
  { name: 'CLOSED', title: '已关闭' },
]

const statusText: Record<OrderStatus, string> = {
  PENDING: '待处理',
  FOLLOWED_UP: '已跟进',
  CLOSED: '已关闭',
}

const finished = computed(() => !initialLoading.value && orders.value.length >= total.value)
const currentStatus = computed(() => activeTab.value === 'ALL' ? undefined : activeTab.value)

function goBack() {
  uni.navigateBack()
}

function resetOrdersState() {
  orders.value = []
  total.value = 0
  pageStart.value = 0
  loadMoreError.value = false
}

async function loadOrders(start = 0, refresh = false) {
  if (loadingMore.value || refreshing.value) {
    return
  }

  if (start === 0) {
    if (refresh) {
      refreshing.value = true
    }
    else {
      initialLoading.value = true
    }
    initialError.value = false
    loadMoreError.value = false
  }
  else {
    loadingMore.value = true
    loadMoreError.value = false
  }

  try {
    const res = await getMyOrders({
      _start: start,
      _end: start + PAGE_SIZE,
      _sort: 'createdAt',
      _order: 'DESC',
      status: currentStatus.value,
    })
    total.value = res.total
    orders.value = start === 0 ? res.data : [...orders.value, ...res.data]
    pageStart.value = orders.value.length
  }
  catch {
    if (start === 0) {
      initialError.value = true
    }
    else {
      loadMoreError.value = true
    }
  }
  finally {
    initialLoading.value = false
    refreshing.value = false
    loadingMore.value = false
  }
}

function handleRefresh() {
  resetOrdersState()
  void loadOrders(0, true)
}

function handleLoadMore() {
  if (initialLoading.value || refreshing.value || loadingMore.value || finished.value) {
    return
  }
  void loadOrders(pageStart.value)
}

watch(activeTab, (value, oldValue) => {
  if (value === oldValue || !pageReady.value) {
    return
  }

  resetOrdersState()
  void loadOrders()
})

onLoad((options) => {
  const status = typeof options?.status === 'string' ? decodeURIComponent(options.status) : ''
  const matchedTab = tabs.find(item => item.name === status)
  if (matchedTab) {
    activeTab.value = matchedTab.name
  }
})

onShow(async () => {
  resetOrdersState()
  await loadOrders()
  pageReady.value = true
})
</script>

<template>
  <view class="page">
    <wd-navbar title="我的订单" left-arrow safe-area-inset-top placeholder fixed :bordered="false" @click-left="goBack" />

    <view class="content-wrapper">
      <wd-tabs v-model="activeTab" color="#f0552b" custom-class="order-tabs" sticky>
        <wd-tab v-for="tab in tabs" :key="tab.name" :name="tab.name" :title="tab.title" />
      </wd-tabs>

      <scroll-view
        scroll-y class="content" :refresher-enabled="true" :refresher-triggered="refreshing"
        lower-threshold="120" :show-scrollbar="false" @refresherrefresh="handleRefresh" @scrolltolower="handleLoadMore"
      >
        <view v-if="initialLoading" class="state">
          <wd-loading size="48rpx" color="#e54d2e" />
          <text>订单加载中...</text>
        </view>

        <view v-else-if="initialError" class="state">
          <text>订单列表加载失败</text>
          <wd-button custom-class="state-btn" @click="loadOrders()">
            重新加载
          </wd-button>
        </view>

        <view v-else-if="!orders.length" class="state">
          暂无订单
        </view>

        <template v-else>
          <view class="list">
            <view v-for="item in orders" :key="item.id" class="order-card" @click="openPage(`/pages/user/order-detail?id=${item.id}`)">
              <view class="order-card__head">
                <text>{{ item.orderNo }}</text>
                <text class="status">{{ statusText[item.status] }}</text>
              </view>
              <view class="order-card__body">
                <view>联系人：{{ item.contactName }}</view>
                <view>数量：{{ item.totalQuantity }} 件</view>
                <view>金额：¥{{ item.totalAmount }}</view>
              </view>
              <view class="order-card__time">
                {{ item.createdAt }}
              </view>
            </view>
          </view>

          <view class="loadmore">
            <wd-loadmore v-if="loadingMore" state="loading" loading-text="正在加载更多订单" />
            <wd-loadmore v-else-if="loadMoreError" state="error" error-text="加载更多失败" @reload="handleLoadMore" />
            <wd-loadmore v-else-if="finished" state="finished" finished-text="订单已全部加载完成" />
          </view>
        </template>
      </scroll-view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f3ee;
}

.content-wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.page :deep(.order-tabs),
.page :deep(.order-tabs .wd-tabs__nav) {
  background: #fff;
}

.content {
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
}

.list {
  padding: 24rpx;
}

.order-card {
  margin-bottom: 20rpx;
  padding: 28rpx;
  background: #fff;
  border-radius: 8rpx;
}

.order-card__head {
  display: flex;
  justify-content: space-between;
  color: #202124;
  font-size: 28rpx;
  font-weight: 700;
}

.status {
  color: #e54d2e;
}

.order-card__body {
  display: grid;
  gap: 10rpx;
  margin-top: 20rpx;
  color: #5f5752;
  font-size: 26rpx;
}

.order-card__time {
  margin-top: 18rpx;
  color: #9a9088;
  font-size: 22rpx;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22rpx;
  min-height: 500rpx;
  color: #8f837a;
  font-size: 28rpx;
}

:deep(.state-btn) {
  min-width: 180rpx !important;
  background: #e54d2e !important;
  border-color: #e54d2e !important;
}

.loadmore {
  padding: 0 0 40rpx;
}
</style>
