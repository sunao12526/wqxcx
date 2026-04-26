<script lang="ts" setup>
definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '关于',
  },
})

function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view>
    <wd-navbar title="关于" left-arrow safe-area-inset-top placeholder fixed :bordered="false" @click-left="goBack" />

    <view class="mt-10 text-center text-green-500">
      关于页面
    </view>
  </view>
</template>
