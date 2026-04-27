<script lang="ts" setup>
import type { ProductCategory, ProductItem } from '@/api/types/app'
import { getProductCategories, getProducts } from '@/api/product'
import { openPage } from '@/utils/app'
import { tabBarHeight } from '@/utils/systemInfo'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '全部商品',
  },
})

const pageStyle = computed(() => ({
  '--tab-bar-height': `${tabBarHeight}px`,
}))

const loading = ref(true)
const products = ref<ProductItem[]>([])
const categories = ref<ProductCategory[]>([])
const activeCategoryId = ref('')

function cover(product: ProductItem) {
  return product.colorImages?.[0]?.imageUrl || '/static/images/default-avatar.png'
}

async function loadProducts() {
  loading.value = true
  try {
    const res = await getProducts({
      _start: 0,
      _end: 50,
      categoryId: activeCategoryId.value || undefined,
    })
    products.value = res.data
  }
  finally {
    loading.value = false
  }
}

async function changeCategory(id: string) {
  activeCategoryId.value = id
  await loadProducts()
}

onShow(async () => {
  const categoryRes = await getProductCategories()
  categories.value = categoryRes.data
  await loadProducts()
})
</script>

<template>
  <scroll-view scroll-y class="page" :style="pageStyle">
    <wd-navbar title="全部商品" safe-area-inset-top placeholder fixed :bordered="false" />

    <scroll-view scroll-x class="tabs">
      <view class="tab" :class="{ 'tab--active': !activeCategoryId }" @click="changeCategory('')">
        全部
      </view>
      <view
        v-for="item in categories" :key="item.id" class="tab" :class="{ 'tab--active': activeCategoryId === item.id }"
        @click="changeCategory(item.id)"
      >
        {{ item.name }}
      </view>
    </scroll-view>

    <view v-if="loading" class="state">
      加载中...
    </view>
    <view v-else-if="!products.length" class="state">
      暂无商品
    </view>
    <view v-else class="grid">
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
  </scroll-view>
</template>

<style lang="scss" scoped>
.page {
  height: calc(100vh - var(--tab-bar-height, 50px));
  background: #f7f3ee;
}

.tabs {
  position: sticky;
  top: 0;
  z-index: 2;
  width: 100%;
  padding: 20rpx 24rpx;
  background: #fff;
  white-space: nowrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 60rpx;
  margin-right: 16rpx;
  padding: 0 28rpx;
  border: 1rpx solid #e6ded7;
  border-radius: 30rpx;
  color: #6b625d;
  font-size: 26rpx;
}

.tab--active {
  border-color: #202124;
  background: #202124;
  color: #ffdfb0;
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

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 480rpx;
  color: #8f837a;
  font-size: 28rpx;
}
</style>
