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

const loading = ref(true)
const status = ref('')
const orders = ref<OrderSummary[]>([])
const statusText: Record<OrderStatus, string> = {
  PENDING: '待处理',
  FOLLOWED_UP: '已跟进',
  CLOSED: '已关闭',
}

const filteredOrders = computed(() => status.value
  ? orders.value.filter(item => item.status === status.value)
  : orders.value)

async function loadOrders() {
  loading.value = true
  try {
    const res = await getMyOrders({ _start: 0, _end: 100 })
    orders.value = res.data
  }
  finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

onLoad((options) => {
  status.value = typeof options?.status === 'string' ? options.status : ''
  void loadOrders()
})
</script>

<template>
  <view class="page">
    <wd-navbar title="我的订单" left-arrow safe-area-inset-top placeholder fixed :bordered="false" @click-left="goBack" />

    <view v-if="loading" class="state">
      加载中...
    </view>
    <view v-else-if="!filteredOrders.length" class="state">
      暂无订单
    </view>
    <view v-else class="list">
      <view v-for="item in filteredOrders" :key="item.id" class="order-card" @click="openPage(`/pages/user/order-detail?id=${item.id}`)">
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
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f3ee;
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
  align-items: center;
  justify-content: center;
  min-height: 500rpx;
  color: #8f837a;
  font-size: 28rpx;
}
</style>
