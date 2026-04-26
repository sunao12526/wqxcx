<script lang="ts" setup>
import { extractRichTextVideos, processRichTextImages, stripRichTextVideos } from '@/utils/richText'

interface Props {
  html?: string
}

const props = withDefaults(defineProps<Props>(), {
  html: '',
})

const richTextHtml = computed(() => processRichTextImages(stripRichTextVideos(props.html)))
const videos = computed(() => extractRichTextVideos(props.html))
</script>

<template>
  <view class="rich-content">
    <view v-if="videos.length" class="rich-content__videos">
      <video
        v-for="(item, index) in videos"
        :key="item.src || index"
        class="rich-content__video"
        :src="item.src"
        :poster="item.poster"
        controls
        show-center-play-btn
        object-fit="contain"
      />
    </view>

    <rich-text class="rich-content__text" :nodes="richTextHtml" />
  </view>
</template>

<style lang="scss" scoped>
.rich-content__videos {
  margin-top: 16rpx;
}

.rich-content__video {
  display: block;
  width: 100%;
  margin-bottom: 20rpx;
  background: #000;
  border-radius: 8rpx;
}

.rich-content__text {
  margin-top: 12rpx;
  color: #5f5752;
  font-size: 26rpx;
  line-height: 1.8;
}
</style>
