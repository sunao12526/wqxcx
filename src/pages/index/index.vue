<script lang="ts" setup>
import type { HomeBanner, ProductCategory } from '@/api/types/app'
import { getActiveHomeBanners, getHomeCategoriesWithProducts } from '@/api/home'
import { openPage } from '@/utils/app'

defineOptions({
  name: 'Home',
})
definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
})

const loading = ref(true)
const error = ref(false)
const banners = ref<HomeBanner[]>([])
const categories = ref<ProductCategory[]>([])

function productCover(product: { colorImages?: Array<{ imageUrl: string }> }) {
  return product.colorImages?.[0]?.imageUrl || '/static/images/default-avatar.png'
}

function openProduct(id?: string | null) {
  if (!id) {
    return
  }
  openPage(`/pages/goods/detail?id=${id}`)
}

function openProductList(categoryId?: string) {
  const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
  openPage(`/pages/goods/list${query}`)
}

async function loadHome() {
  loading.value = true
  error.value = false
  try {
    const [bannerRes, categoryRes] = await Promise.all([
      getActiveHomeBanners(),
      getHomeCategoriesWithProducts(),
    ])
    banners.value = bannerRes.data
    categories.value = categoryRes.data
  }
  catch {
    error.value = true
  }
  finally {
    loading.value = false
  }
}

onShow(() => {
  void loadHome()
})
</script>

<template>
  <scroll-view scroll-y class="page">
    <wd-navbar title="品人家居" custom-class="app-navbar" safe-area-inset-top placeholder fixed :bordered="false" />

    <view class="header">
      <view class="header__title">
        品人家居
      </view>
      <view class="header__subtitle">
        精选家居好物，一键提交采购需求
      </view>
    </view>

    <view v-if="loading" class="state">
      加载中...
    </view>

    <view v-else-if="error" class="state">
      <view>需要登录后查看商品</view>
      <wd-button custom-class="state-btn" @click="openPage('/pages/user/login')">
        去登录
      </wd-button>
    </view>

    <template v-else>
      <swiper v-if="banners.length" class="banner" circular autoplay indicator-dots>
        <swiper-item v-for="item in banners" :key="item.id" @click="openProduct(item.productId)">
          <image class="banner__image" :src="item.imageUrl" mode="aspectFill" />
        </swiper-item>
      </swiper>

      <view v-if="categories.length" class="category-strip">
        <view v-for="item in categories" :key="item.id" class="category-item" @click="openProductList(item.id)">
          <image v-if="item.imageUrl" class="category-item__image" :src="item.imageUrl" mode="aspectFill" />
          <view v-else class="category-item__placeholder">
            {{ item.name.slice(0, 1) }}
          </view>
          <text>{{ item.name }}</text>
        </view>
      </view>

      <view v-for="category in categories.filter(item => item.products?.length)" :key="category.id" class="section">
        <view class="section__head">
          <text>{{ category.name }}</text>
          <view class="section__more" @click="openProductList(category.id)">
            更多
            <wd-icon name="arrow-right" size="13px" />
          </view>
        </view>
        <scroll-view scroll-x class="row-products">
          <view
            v-for="item in category.products" :key="item.id" class="row-product"
            @click="openProduct(item.id)"
          >
            <image class="row-product__image" :src="productCover(item)" mode="aspectFill" />
            <view class="row-product__name">
              {{ item.name }}
            </view>
            <view class="row-product__price">
              ¥{{ item.price }}
            </view>
          </view>
        </scroll-view>
      </view>

      <view v-if="!categories.some(item => item.products?.length)" class="state">
        暂无商品
      </view>
    </template>
  </scroll-view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f3ee;
}

.header {
  padding: 32rpx 32rpx 28rpx;
  background: #202124;
  color: #fff;
}

.header__title {
  font-size: 46rpx;
  font-weight: 700;
}

.header__subtitle {
  margin-top: 12rpx;
  color: #f2d6b7;
  font-size: 26rpx;
}

.banner {
  height: 320rpx;
  margin: 24rpx 24rpx 0;
  overflow: hidden;
  border-radius: 8rpx;
}

.banner__image {
  width: 100%;
  height: 100%;
}

.category-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  padding: 28rpx 24rpx 8rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  color: #302821;
  font-size: 24rpx;
}

.category-item__image,
.category-item__placeholder {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
}

.category-item__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ead4bb;
  color: #6d4828;
  font-size: 34rpx;
  font-weight: 700;
}

.section {
  margin-top: 24rpx;
  padding: 0 24rpx;
}

.section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
  color: #202124;
  font-size: 32rpx;
  font-weight: 700;
}

.section__more {
  display: flex;
  align-items: center;
  color: #7b6f68;
  font-size: 24rpx;
  font-weight: 400;
}

.row-product__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-product__price {
  color: #e54d2e;
  font-weight: 700;
}

:deep(.app-navbar .wd-navbar__wrapper) {
  background: #202124;
}

:deep(.app-navbar .wd-navbar__title) {
  color: #ffdfb0;
  font-weight: 700;
}

.row-products {
  width: 100%;
  white-space: nowrap;
}

.row-product {
  display: inline-block;
  width: 220rpx;
  margin-right: 18rpx;
  overflow: hidden;
  background: #fff;
  border-radius: 8rpx;
  vertical-align: top;
}

.row-product__image {
  width: 220rpx;
  height: 220rpx;
  background: #eee;
}

.row-product__name {
  padding: 14rpx 14rpx 8rpx;
  color: #202124;
  font-size: 24rpx;
}

.row-product__price {
  padding: 0 14rpx 16rpx;
  font-size: 24rpx;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  min-height: 420rpx;
  color: #7b6f68;
  font-size: 28rpx;
}

:deep(.state-btn) {
  min-width: 180rpx !important;
  background: #e54d2e !important;
  border-color: #e54d2e !important;
}
</style>
