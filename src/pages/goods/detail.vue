<script lang="ts" setup>
import type { ProductColorImage, ProductItem } from '@/api/types/app'
import { createOrder } from '@/api/order'
import { getProductDetail } from '@/api/product'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '商品详情',
  },
})

const productId = ref('')
const loading = ref(true)
const submitting = ref(false)
const product = ref<ProductItem>()
const activeColorId = ref('')
const activeSizeId = ref('')
const quantity = ref(1)
const contactName = ref('')
const contactPhone = ref('')
const wechatNo = ref('')
const remark = ref('')

const currentImage = computed(() => {
  const images = product.value?.colorImages || []
  return images.find(item => item.colorId === activeColorId.value)?.imageUrl || images[0]?.imageUrl || '/static/images/default-avatar.png'
})

const minQty = computed(() => Math.max(product.value?.minOrderQty || 1, 1))
const totalAmount = computed(() => (product.value?.price || 0) * quantity.value)

function selectColor(item: ProductColorImage) {
  activeColorId.value = item.colorId
}

function changeQty(delta: number) {
  quantity.value = Math.max(minQty.value, quantity.value + delta)
}

function goBack() {
  uni.navigateBack()
}

async function submitOrder() {
  if (!product.value || !activeColorId.value || !activeSizeId.value) {
    uni.showToast({ title: '请选择颜色和尺码', icon: 'none' })
    return
  }
  if (!contactName.value || !contactPhone.value) {
    uni.showToast({ title: '请填写联系人和手机号', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const order = await createOrder({
      contactName: contactName.value,
      contactPhone: contactPhone.value,
      wechatNo: wechatNo.value || null,
      remark: remark.value || null,
      items: [{
        productId: product.value.id,
        colorId: activeColorId.value,
        sizeId: activeSizeId.value,
        quantity: quantity.value,
      }],
    })
    uni.showToast({ title: '提交成功', icon: 'success' })
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/user/order-detail?id=${order.id}` })
    }, 600)
  }
  finally {
    submitting.value = false
  }
}

onLoad(async (options) => {
  productId.value = typeof options?.id === 'string' ? options.id : ''
  if (!productId.value) {
    loading.value = false
    return
  }

  try {
    product.value = await getProductDetail(productId.value)
    activeColorId.value = product.value.colorImages?.[0]?.colorId || ''
    activeSizeId.value = product.value.sizeIds?.[0] || ''
    quantity.value = minQty.value
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <scroll-view scroll-y class="page">
    <wd-navbar title="商品详情" left-arrow safe-area-inset-top placeholder fixed :bordered="false" @click-left="goBack" />

    <view v-if="loading" class="state">
      加载中...
    </view>
    <view v-else-if="!product" class="state">
      商品不存在
    </view>
    <template v-else>
      <image class="cover" :src="currentImage" mode="aspectFill" />
      <view class="panel">
        <view class="title">
          {{ product.name }}
        </view>
        <view class="summary">
          <text class="price">¥{{ product.price }}</text>
          <text>{{ product.minOrderQty }}件起订</text>
        </view>
        <view class="attrs">
          <text v-if="product.category">{{ product.category.name }}</text>
          <text v-if="product.kind">{{ product.kind.name }}</text>
          <text v-if="product.material">{{ product.material.name }}</text>
          <text v-if="product.style">{{ product.style.name }}</text>
        </view>
      </view>

      <view class="panel">
        <view class="block-title">
          颜色
        </view>
        <view class="options">
          <view
            v-for="item in product.colorImages" :key="item.colorId" class="option"
            :class="{ 'option--active': activeColorId === item.colorId }" @click="selectColor(item)"
          >
            {{ item.color?.name || '颜色' }}
          </view>
        </view>

        <view class="block-title">
          尺码
        </view>
        <view class="options">
          <view
            v-for="item in product.sizes" :key="item.id" class="option"
            :class="{ 'option--active': activeSizeId === item.id }" @click="activeSizeId = item.id"
          >
            {{ item.name }}
          </view>
        </view>

        <view class="qty-row">
          <text>数量</text>
          <view class="stepper">
            <view class="stepper__btn" @click="changeQty(-1)">
              -
            </view>
            <view class="stepper__num">
              {{ quantity }}
            </view>
            <view class="stepper__btn" @click="changeQty(1)">
              +
            </view>
          </view>
        </view>
      </view>

      <view class="panel">
        <view class="block-title">
          联系信息
        </view>
        <input v-model="contactName" class="input" placeholder="联系人">
        <input v-model="contactPhone" class="input" type="number" placeholder="手机号">
        <input v-model="wechatNo" class="input" placeholder="微信号（选填）">
        <textarea v-model="remark" class="textarea" placeholder="备注（选填）" />
      </view>

      <view class="bottom-bar">
        <view>
          <text class="bottom-bar__label">合计</text>
          <text class="bottom-bar__price">¥{{ totalAmount }}</text>
        </view>
        <wd-button custom-class="submit-btn" :loading="submitting" @click="submitOrder">
          提交订单
        </wd-button>
      </view>
    </template>
  </scroll-view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding-bottom: 140rpx;
  background: #f7f3ee;
}

.cover {
  width: 100%;
  height: 680rpx;
  background: #eee;
}

.panel {
  margin: 20rpx 24rpx 0;
  padding: 28rpx;
  background: #fff;
  border-radius: 8rpx;
}

.title {
  color: #202124;
  font-size: 36rpx;
  font-weight: 700;
}

.summary {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-top: 18rpx;
  color: #8f837a;
  font-size: 24rpx;
}

.price,
.bottom-bar__price {
  color: #e54d2e;
  font-weight: 700;
}

.price {
  font-size: 40rpx;
}

.attrs,
.options {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
}

.attrs {
  margin-top: 18rpx;
  color: #7b6f68;
  font-size: 24rpx;
}

.attrs text {
  padding: 8rpx 16rpx;
  background: #f7f3ee;
  border-radius: 4rpx;
}

.block-title {
  margin: 8rpx 0 18rpx;
  color: #202124;
  font-size: 30rpx;
  font-weight: 700;
}

.option {
  min-width: 120rpx;
  padding: 16rpx 22rpx;
  border: 1rpx solid #e6ded7;
  border-radius: 6rpx;
  color: #5f5752;
  font-size: 26rpx;
  text-align: center;
}

.option--active {
  border-color: #202124;
  background: #202124;
  color: #ffdfb0;
}

.qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 34rpx;
  color: #202124;
  font-size: 28rpx;
}

.stepper {
  display: flex;
  overflow: hidden;
  border: 1rpx solid #e6ded7;
  border-radius: 6rpx;
}

.stepper__btn,
.stepper__num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 56rpx;
}

.stepper__num {
  width: 88rpx;
  border-right: 1rpx solid #e6ded7;
  border-left: 1rpx solid #e6ded7;
}

.input,
.textarea {
  box-sizing: border-box;
  width: 100%;
  margin-top: 16rpx;
  padding: 0 22rpx;
  background: #f7f3ee;
  border-radius: 6rpx;
  color: #202124;
  font-size: 28rpx;
}

.input {
  height: 80rpx;
}

.textarea {
  height: 150rpx;
  padding-top: 20rpx;
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.bottom-bar__label {
  margin-right: 10rpx;
  color: #7b6f68;
  font-size: 24rpx;
}

.bottom-bar__price {
  font-size: 38rpx;
}

:deep(.submit-btn) {
  width: 240rpx !important;
  height: 76rpx !important;
  border: none !important;
  border-radius: 38rpx !important;
  background: #e54d2e !important;
}

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 600rpx;
  color: #8f837a;
  font-size: 28rpx;
}
</style>
