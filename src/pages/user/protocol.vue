<script lang="ts" setup>
import type { AgreementType } from '@/api/agreement'
import { getAgreementByType } from '@/api/agreement'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '协议详情',
  },
})

const agreementTypeTitleMap: Record<AgreementType, string> = {
  0: '关于我们',
  1: '用户协议',
  2: '隐私政策',
}

const agreementType = ref<AgreementType>(1)
const loading = ref(false)
const error = ref(false)
const title = ref('')
const content = ref('')

const pageTitle = computed(() => title.value || agreementTypeTitleMap[agreementType.value] || '协议详情')

function parseAgreementType(value: unknown): AgreementType {
  const nextType = Number(value)
  return ([0, 1, 2].includes(nextType) ? nextType : 1) as AgreementType
}

function goBack() {
  uni.navigateBack()
}

async function loadAgreement() {
  if (loading.value) {
    return
  }

  loading.value = true
  error.value = false

  try {
    const response = await getAgreementByType(agreementType.value)
    title.value = response.title
    content.value = response.content || ''
  }
  catch {
    error.value = true
  }
  finally {
    loading.value = false
  }
}

onLoad((options) => {
  agreementType.value = parseAgreementType(options?.type)
  void loadAgreement()
})
</script>

<template>
  <view class="page">
    <wd-navbar :title="pageTitle" left-arrow safe-area-inset-top placeholder fixed :bordered="false" @click-left="goBack" />

    <scroll-view scroll-y class="content" :show-scrollbar="false">
      <view v-if="loading" class="state-card">
        <wd-loading size="52rpx" color="#e54d2e" />
        <text class="state-card__text">内容加载中...</text>
      </view>

      <view v-else-if="error" class="state-card">
        <text class="state-card__title">协议内容加载失败</text>
        <text class="state-card__desc">可以重新尝试加载。</text>
        <wd-button size="small" round custom-class="retry-btn" @click="loadAgreement">
          重新加载
        </wd-button>
      </view>

      <view v-else-if="content" class="protocol-card">
        <fg-rich-content :html="content" />
      </view>

      <view v-else class="state-card">
        <text class="state-card__title">暂无协议内容</text>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}

.content {
  flex: 1;
  min-height: 0;
  box-sizing: border-box;
  padding: 24rpx 24rpx 40rpx;
}

.protocol-card {
  padding: 16rpx 8rpx 32rpx;
  background: #fff;
}

.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  min-height: 50vh;
  padding: 40rpx 24rpx;
  text-align: center;
}

.state-card__text,
.state-card__title {
  color: #8b8277;
  font-size: 28rpx;
}

.state-card__desc {
  color: #b1aa9f;
  font-size: 24rpx;
}

:deep(.retry-btn) {
  background: #e54d2e !important;
  border-color: #e54d2e !important;
}
</style>
