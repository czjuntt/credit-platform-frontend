<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="page-header">
          <h1>普惠信贷政策</h1>
          <p>了解最新普惠金融相关政策</p>
        </div>

        <div class="filter-bar">
          <el-select v-model="selectedBank" placeholder="选择银行" clearable style="width: 200px">
            <el-option v-for="bank in banks" :key="bank.id" :label="bank.bank_name" :value="bank.id" />
          </el-select>
        </div>

        <div class="content-list" v-loading="loading">
          <div class="content-item" v-for="item in filteredItems" :key="item.id" @click="goDetail(item.id)">
            <div class="item-header">
              <span class="item-title">{{ item.title }}</span>
              <span class="item-bank">{{ getBankName(item.bank_id) }}</span>
            </div>
            <div class="item-preview">{{ item.content?.substring(0, 100) }}...</div>
            <div class="item-footer">
              <span class="item-time">{{ item.publish_time?.split('T')[0] || '未知' }}</span>
              <el-button size="small" type="primary" link>查看详情 →</el-button>
            </div>
          </div>
          <el-empty v-if="filteredItems.length === 0 && !loading" description="暂无政策信息" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { getPolicies, getBanks } from '../../api'

const router = useRouter()
const items = ref([])
const banks = ref([])
const loading = ref(false)
const selectedBank = ref(null)

const filteredItems = computed(() => {
  let data = items.value
  if (selectedBank.value) {
    data = data.filter(i => i.bank_id === selectedBank.value)
  }
  return data
})

function getBankName(bankId) {
  const bank = banks.value.find(b => b.id === bankId)
  return bank?.bank_name || '未知'
}

function goDetail(id) {
  router.push(`/policies/${id}`)
}

async function loadData() {
  loading.value = true
  try {
    const [itemsData, banksData] = await Promise.all([
      getPolicies({ status: 1 }),
      getBanks()
    ])
    items.value = itemsData
    banks.value = banksData
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
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

.page-header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    font-size: 28px;
    color: #1a365d;
    margin-bottom: 8px;
  }

  p {
    color: #999;
  }
}

.filter-bar {
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-end;
}

.content-list {
  .content-item {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .item-title {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }

      .item-bank {
        font-size: 12px;
        color: #1890ff;
        background: #e6f7ff;
        padding: 4px 10px;
        border-radius: 12px;
      }
    }

    .item-preview {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 12px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .item-time {
        color: #999;
        font-size: 13px;
      }
    }
  }
}
</style>
