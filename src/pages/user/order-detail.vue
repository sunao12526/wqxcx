<script lang="ts" setup>
import type { OrderDetail, OrderStatus } from '@/api/types/app'
import { getMyOrderDetail } from '@/api/order'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '订单详情',
  },
})

const loading = ref(true)
const order = ref<OrderDetail>()
const statusText: Record<OrderStatus, string> = {
  PENDING: '待处理',
  FOLLOWED_UP: '已跟进',
  CLOSED: '已关闭',
}

function goBack() {
  uni.navigateBack()
}

onLoad(async (options) => {
  const id = typeof options?.id === 'string' ? options.id : ''
  if (!id) {
    loading.value = false
    return
  }

  try {
    order.value = await getMyOrderDetail(id)
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <scroll-view scroll-y class="page">
    <wd-navbar title="订单详情" left-arrow safe-area-inset-top placeholder fixed :bordered="false" @click-left="goBack" />

    <view v-if="loading" class="state">
      加载中...
    </view>
    <view v-else-if="!order" class="state">
      订单不存在
    </view>
    <template v-else>
      <view class="summary">
        <view class="summary__status">
          {{ statusText[order.status] }}
        </view>
        <view class="summary__no">
          {{ order.orderNo }}
        </view>
      </view>

      <view class="panel">
        <view class="panel__title">
          商品明细
        </view>
        <view v-for="item in order.items" :key="item.id" class="goods">
          <view class="goods__name">
            {{ item.productNameSnapshot }}
          </view>
          <view class="goods__meta">
            {{ item.categoryNameSnapshot }} / {{ item.colorNameSnapshot }} / {{ item.sizeNameSnapshot }}
          </view>
          <view class="goods__foot">
            <text>¥{{ item.unitPriceSnapshot }} x {{ item.quantity }}</text>
            <text class="price">¥{{ item.subtotalAmount }}</text>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="panel__title">
          联系信息
        </view>
        <view class="info-row">
          <text>联系人</text>
          <text>{{ order.contactName }}</text>
        </view>
        <view class="info-row">
          <text>手机号</text>
          <text>{{ order.contactPhone }}</text>
        </view>
        <view v-if="order.wechatNo" class="info-row">
          <text>微信号</text>
          <text>{{ order.wechatNo }}</text>
        </view>
        <view v-if="order.remark" class="info-row">
          <text>备注</text>
          <text>{{ order.remark }}</text>
        </view>
      </view>

      <view class="panel">
        <view class="info-row">
          <text>总数量</text>
          <text>{{ order.totalQuantity }} 件</text>
        </view>
        <view class="info-row">
          <text>总金额</text>
          <text class="price">¥{{ order.totalAmount }}</text>
        </view>
        <view class="info-row">
          <text>创建时间</text>
          <text>{{ order.createdAt }}</text>
        </view>
      </view>
    </template>
  </scroll-view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f3ee;
}

.summary {
  padding: 32rpx 32rpx 48rpx;
  background: #202124;
  color: #ffdfb0;
}

.summary__status {
  font-size: 42rpx;
  font-weight: 700;
}

.summary__no {
  margin-top: 12rpx;
  font-size: 24rpx;
}

.panel {
  margin: 20rpx 24rpx 0;
  padding: 28rpx;
  background: #fff;
  border-radius: 8rpx;
}

.panel__title {
  margin-bottom: 20rpx;
  color: #202124;
  font-size: 30rpx;
  font-weight: 700;
}

.goods {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0ebe6;
}

.goods:last-child {
  border-bottom: none;
}

.goods__name {
  color: #202124;
  font-size: 28rpx;
  font-weight: 600;
}

.goods__meta,
.goods__foot,
.info-row {
  color: #7b6f68;
  font-size: 25rpx;
}

.goods__meta {
  margin-top: 10rpx;
}

.goods__foot,
.info-row {
  display: flex;
  justify-content: space-between;
  margin-top: 14rpx;
}

.price {
  color: #e54d2e;
  font-weight: 700;
}

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 520rpx;
  color: #8f837a;
  font-size: 28rpx;
}
</style>
