<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="detail-header">
          <button class="back-btn" @click="goBack">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>返回</span>
          </button>
        </div>
        <div class="detail-card" v-loading="loading">
          <template v-if="detail">
            <div class="detail-title">{{ detail.title }}</div>
            <div class="detail-meta">
              <span class="meta-item">
                <el-icon><OfficeBuilding /></el-icon>
                {{ getBankName(detail.bank_id) }}
              </span>
              <span class="meta-item">
                <el-icon><Clock /></el-icon>
                {{ detail.publish_time?.split('T')[0] || '-' }}
              </span>
            </div>
            <div class="detail-content" v-html="formattedContent"></div>
            <div class="detail-attachments" v-if="detail.file_path">
              <h4>相关附件</h4>
              <a :href="detail.file_path" target="_blank" class="attachment-link">
                <el-icon><Document /></el-icon>
                下载附件
              </a>
            </div>
          </template>
          <el-empty v-else-if="!loading" description="未找到内容" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { getPolicies, getBanks } from '../../api'

const route = useRoute()
const router = useRouter()
const detail = ref(null)
const banks = ref([])
const loading = ref(false)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/policies')
  }
}

const formattedContent = computed(() => {
  if (!detail.value?.content) return ''
  return detail.value.content.replace(/\n/g, '<br>')
})

function getBankName(bankId) {
  const bank = banks.value.find(b => b.id === bankId)
  return bank?.bank_name || '未知'
}

async function loadDetail() {
  loading.value = true
  try {
    const id = route.params.id
    const [items, banksData] = await Promise.all([
      getPolicies(),
      getBanks()
    ])
    detail.value = items.find(i => i.id === Number(id))
    banks.value = banksData
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
</script>

<style scoped lang="scss">
.front-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7fafc;
}

.main-content {
  flex: 1;
  padding: 30px 0;
}

.page-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.detail-header {
  margin-bottom: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background: #f0f0f0;
    transform: scale(0.96);
  }
}

.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-title {
  font-size: 24px;
  font-weight: bold;
  color: #1a365d;
  margin-bottom: 16px;
  line-height: 1.4;
}

.detail-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #999;
    font-size: 14px;
  }
}

.detail-content {
  color: #333;
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.detail-attachments {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;

  h4 {
    font-size: 16px;
    margin-bottom: 16px;
    color: #333;
  }

  .attachment-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: #e6f7ff;
    color: #1890ff;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.3s;

    &:hover {
      background: #bae7ff;
    }
  }
}
</style>
