<script lang="ts" setup>
import { updateSelfProfile } from '@/api/login'
import useUpload from '@/hooks/useUpload'
import { useTokenStore, useUserStore } from '@/store'
import { openPage, showInfoToast, showSuccessToast } from '@/utils/app'
import { getEnvBaseUrl } from '@/utils/index'

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '个人信息',
  },
})

const DEFAULT_AVATAR = '/static/images/default-avatar.png'
const tokenStore = useTokenStore()
const userStore = useUserStore()

const loading = ref(false)
const saving = ref(false)
const nickname = ref('')
const phoneNumber = ref('')
const avatarUrl = ref('')
const apiBaseUrl = getEnvBaseUrl()

const hasLogin = computed(() => tokenStore.updateNowTime().hasLogin)
const avatarPreview = computed(() => avatarUrl.value || userStore.userInfo.avatar || DEFAULT_AVATAR)

const avatarUpload = useUpload({
  fileType: 'image',
  maxSize: 2 * 1024 * 1024,
  success: (res) => {
    const url = resolveUploadUrl(res)
    if (!url) {
      showInfoToast('头像上传成功但未返回图片链接')
      return
    }
    avatarUrl.value = url
    showSuccessToast('头像已上传')
  },
  error: () => {
    showInfoToast('头像上传失败')
  },
})
const profileSubmitting = computed(() => saving.value || loading.value || avatarUpload.loading.value)

function resolveUploadUrl(res: any): string {
  if (typeof res === 'string') {
    return normalizeAssetUrl(res)
  }

  const file = res?.data?.data || res?.data || res
  const url = file?.url || file?.fileUrl || file?.avatarUrl || file?.path
  return typeof url === 'string' ? normalizeAssetUrl(url) : ''
}

function normalizeAssetUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url
  }

  if (url.startsWith('/')) {
    return new URL(url, apiBaseUrl).toString()
  }

  return ''
}

function getSavedAvatarUrl() {
  const { avatarUrl: savedAvatarUrl, avatar } = userStore.userInfo
  if (savedAvatarUrl) {
    return normalizeAssetUrl(savedAvatarUrl)
  }
  return avatar && /^https?:\/\//i.test(avatar) ? avatar : ''
}

function syncForm() {
  const userInfo = userStore.userInfo
  const savedAvatarUrl = getSavedAvatarUrl()
  nickname.value = userInfo.nickname || userInfo.username || ''
  phoneNumber.value = userInfo.phoneNumber || ''
  avatarUrl.value = savedAvatarUrl
}

async function loadProfile() {
  if (!hasLogin.value) {
    showInfoToast('请先登录')
    openPage('/pages/user/login?redirect=/pages/user/profile')
    return
  }

  loading.value = true
  try {
    const userInfo = userStore.userInfo
    if (!userInfo.userId && !userInfo.sub && !userInfo.id) {
      await userStore.fetchUserInfo()
    }
    syncForm()
  }
  finally {
    loading.value = false
  }
}

async function saveProfile() {
  if (!hasLogin.value) {
    showInfoToast('请先登录')
    openPage('/pages/user/login?redirect=/pages/user/profile')
    return
  }

  const nextAvatar = avatarUrl.value.trim()
  const nextNickname = nickname.value.trim()
  const nextPhone = phoneNumber.value.trim()

  if (nextPhone && !/^1\d{10}$/.test(nextPhone)) {
    showInfoToast('请输入正确的手机号')
    return
  }

  if (nextAvatar && !/^https?:\/\//i.test(nextAvatar)) {
    showInfoToast('请输入头像图片链接')
    return
  }

  saving.value = true
  try {
    const userInfo = await updateSelfProfile({
      nickname: nextNickname || null,
      phoneNumber: nextPhone || null,
      avatarUrl: nextAvatar || null,
    })
    userStore.setUserInfo({
      ...userStore.userInfo,
      ...userInfo,
      nickname: nextNickname || '',
      phoneNumber: nextPhone || null,
      avatarUrl: nextAvatar || null,
      avatar: nextAvatar || userInfo.avatar || userStore.userInfo.avatar,
    })
    syncForm()
    showSuccessToast('保存成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  }
  finally {
    saving.value = false
  }
}

function goBack() {
  uni.navigateBack()
}

function chooseAvatar() {
  avatarUpload.run()
}

onShow(() => {
  void loadProfile()
})
</script>

<template>
  <view class="page">
    <wd-navbar title="个人信息" custom-class="app-navbar" left-arrow placeholder safe-area-inset-top fixed :bordered="false" @click-left="goBack" />

    <view class="profile-head" @click="chooseAvatar">
      <image class="avatar" :src="avatarPreview" mode="aspectFill" />
      <view class="avatar-action">
        更换头像
      </view>
    </view>

    <view class="form-card">
      <view class="form-row">
        <text class="form-row__label">
          昵称
        </text>
        <input v-model="nickname" class="form-row__input" type="text" :maxlength="20" placeholder="请输入昵称" placeholder-class="input-placeholder">
      </view>
      <view class="form-row">
        <text class="form-row__label">
          手机号
        </text>
        <input v-model="phoneNumber" class="form-row__input" type="number" :maxlength="11" placeholder="请输入手机号" placeholder-class="input-placeholder">
      </view>
    </view>

    <view class="actions">
      <wd-button block custom-class="save-btn" :loading="profileSubmitting" :disabled="profileSubmitting" @click="saveProfile">
        保存
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f3ee;
}

:deep(.app-navbar .wd-navbar__wrapper) {
  background: #202124;
}

:deep(.app-navbar .wd-navbar__title),
:deep(.app-navbar .wd-navbar__left) {
  color: #ffdfb0;
}

.profile-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56rpx 32rpx 44rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border: 6rpx solid #fff;
  border-radius: 50%;
  background: #eee;
  box-shadow: 0 12rpx 32rpx rgba(32, 33, 36, 0.12);
}

.avatar-action {
  margin-top: 18rpx;
  color: #e54d2e;
  font-size: 26rpx;
  font-weight: 600;
}

.form-card {
  margin: 0 24rpx;
  padding: 0 28rpx;
  border-radius: 8rpx;
  background: #fff;
}

.form-row {
  display: flex;
  align-items: center;
  min-height: 108rpx;
  border-bottom: 1rpx solid #f0ebe6;
}

.form-row:last-child {
  border-bottom: none;
}

.form-row__label {
  width: 152rpx;
  color: #202124;
  font-size: 28rpx;
  font-weight: 600;
}

.form-row__input {
  flex: 1;
  min-width: 0;
  color: #202124;
  font-size: 28rpx;
  text-align: right;
}

.input-placeholder {
  color: #b9afa8;
}

.actions {
  padding: 48rpx 32rpx;
}

:deep(.save-btn) {
  height: 88rpx !important;
  border: none !important;
  border-radius: 44rpx !important;
  background: #e54d2e !important;
  color: #fff !important;
  font-size: 30rpx !important;
  font-weight: 700 !important;
}
</style>
