<script lang="ts" setup>
import type { ProductItem } from '@/api/types/app'
import { getFavoriteProducts } from '@/api/product'
import { openPage } from '@/utils/app'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '我的收藏',
  },
})

const PAGE_SIZE = 20

const products = ref<ProductItem[]>([])
const total = ref(0)
const loading = ref(true)
const refreshing = ref(false)
const loadingMore = ref(false)
const pageStart = ref(0)
const loadError = ref(false)

const finished = computed(() => !loading.value && products.value.length >= total.value)

function goBack() {
  uni.navigateBack()
}

function cover(product: ProductItem) {
  return product.colorImages?.[0]?.imageUrl || '/static/images/default-avatar.png'
}

async function loadFavorites(start = 0, refresh = false) {
  if (loadingMore.value || refreshing.value) {
    return
  }

  if (start === 0) {
    if (refresh) {
      refreshing.value = true
    }
    else {
      loading.value = true
    }
    loadError.value = false
  }
  else {
    loadingMore.value = true
  }

  try {
    const response = await getFavoriteProducts({
      _start: start,
      _end: start + PAGE_SIZE,
      _sort: 'createdAt',
      _order: 'DESC',
    })
    total.value = response.total
    products.value = start === 0 ? response.data : [...products.value, ...response.data]
    pageStart.value = products.value.length
  }
  catch {
    loadError.value = true
  }
  finally {
    loading.value = false
    refreshing.value = false
    loadingMore.value = false
  }
}

function refreshFavorites() {
  void loadFavorites(0, true)
}

function loadMore() {
  if (finished.value || loading.value || loadingMore.value) {
    return
  }
  void loadFavorites(pageStart.value)
}

onShow(() => {
  void loadFavorites(0)
})
</script>

<template>
  <view class="page">
    <wd-navbar title="我的收藏" left-arrow safe-area-inset-top placeholder fixed :bordered="false" @click-left="goBack" />

    <scroll-view
      scroll-y class="content" :refresher-enabled="true" :refresher-triggered="refreshing"
      lower-threshold="120" @refresherrefresh="refreshFavorites" @scrolltolower="loadMore"
    >
      <view v-if="loading" class="state">
        <wd-loading size="48rpx" color="#e54d2e" />
        <text>收藏商品加载中...</text>
      </view>

      <view v-else-if="loadError && !products.length" class="state">
        <text>收藏列表加载失败</text>
        <wd-button custom-class="state-btn" @click="loadFavorites(0)">
          重新加载
        </wd-button>
      </view>

      <view v-else-if="!products.length" class="empty">
        <image class="empty__image" src="/static/images/img-no-collection@2x.png" mode="aspectFit" />
        <view class="empty__title">
          暂无收藏
        </view>
        <view class="empty__desc">
          遇到喜欢的家居好物，可以在商品详情页点亮收藏
        </view>
        <wd-button custom-class="state-btn" @click="openPage('/pages/goods/list')">
          去逛逛
        </wd-button>
      </view>

      <template v-else>
        <view class="grid">
          <view v-for="item in products" :key="item.id" class="card" @click="openPage(`/pages/goods/detail?id=${item.id}`)">
            <image class="card__image" :src="cover(item)" mode="aspectFill" />
            <view class="card__body">
              <view class="card__name">
                {{ item.name }}
              </view>
              <view class="card__tags">
                <text v-if="item.category">{{ item.category.name }}</text>
                <text v-if="item.material">{{ item.material.name }}</text>
              </view>
              <view class="card__foot">
                <text class="price">¥{{ item.price }}</text>
                <text>{{ item.minOrderQty }}件起订</text>
              </view>
            </view>
          </view>
        </view>

        <view class="loadmore">
          <wd-loadmore v-if="loadingMore" state="loading" loading-text="正在加载更多收藏" />
          <wd-loadmore v-else-if="finished" state="finished" finished-text="收藏商品已全部加载完成" />
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f7f3ee;
}

.content {
  flex: 1;
  min-height: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  padding: 24rpx;
}

.card {
  overflow: hidden;
  background: #fff;
  border-radius: 8rpx;
}

.card__image {
  width: 100%;
  height: 310rpx;
  background: #eee;
}

.card__body {
  padding: 18rpx;
}

.card__name {
  overflow: hidden;
  color: #202124;
  font-size: 28rpx;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card__tags {
  display: flex;
  gap: 10rpx;
  min-height: 34rpx;
  margin-top: 10rpx;
  color: #8f837a;
  font-size: 22rpx;
}

.card__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14rpx;
  color: #958a82;
  font-size: 22rpx;
}

.price {
  color: #e54d2e;
  font-size: 30rpx;
  font-weight: 700;
}

.state,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 22rpx;
  min-height: 560rpx;
  color: #8f837a;
  font-size: 28rpx;
}

.empty {
  padding: 80rpx 64rpx;
  text-align: center;
}

.empty__image {
  width: 240rpx;
  height: 200rpx;
}

.empty__title {
  color: #202124;
  font-size: 32rpx;
  font-weight: 700;
}

.empty__desc {
  color: #8f837a;
  font-size: 24rpx;
  line-height: 1.6;
}

:deep(.state-btn) {
  min-width: 180rpx !important;
  background: #e54d2e !important;
  border-color: #e54d2e !important;
}

.loadmore {
  padding: 8rpx 0 40rpx;
}
</style>
