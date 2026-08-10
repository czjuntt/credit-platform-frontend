<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="page-header">
          <h1>普惠信贷案例</h1>
          <p>真实成功案例参考</p>
        </div>

        <div class="filter-bar">
          <el-select v-model="selectedBank" placeholder="选择银行" clearable style="width: 200px">
            <el-option v-for="bank in banks" :key="bank.id" :label="bank.bank_name" :value="bank.id" />
          </el-select>
        </div>

        <div class="case-grid" v-loading="loading">
          <div class="case-card" v-for="item in filteredItems" :key="item.id" @click="goDetail(item.id)">
            <div class="card-header">
              <span class="bank-tag">{{ getBankName(item.bank_id) }}</span>
              <span class="amount-tag">{{ item.amount }}万元</span>
            </div>
            <div class="card-body">
              <h3>{{ item.title }}</h3>
              <div class="case-info">
                <span class="industry" v-if="item.industry">
                  <el-icon><OfficeBuilding /></el-icon>
                  {{ item.industry }}
                </span>
              </div>
              <p class="desc-preview">{{ item.description?.substring(0, 100) }}...</p>
            </div>
            <div class="card-footer">
              <el-button size="small" type="primary" link>查看详情 →</el-button>
            </div>
          </div>
          <el-empty v-if="filteredItems.length === 0 && !loading" description="暂无案例信息" />
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
import { getCases, getBanks } from '../../api'

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
  router.push(`/cases/${id}`)
}

async function loadData() {
  loading.value = true
  try {
    const [itemsData, banksData] = await Promise.all([
      getCases({ status: 1 }),
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
  max-width: 1100px;
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

.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.case-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-header {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .bank-tag {
      color: #fff;
      font-size: 13px;
    }

    .amount-tag {
      background: #fff;
      color: #1890ff;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: bold;
      font-size: 14px;
    }
  }

  .card-body {
    padding: 20px;

    h3 {
      font-size: 18px;
      color: #333;
      margin-bottom: 12px;
    }

    .case-info {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;

      .industry {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #666;
        font-size: 13px;
      }
    }

    .desc-preview {
      color: #999;
      font-size: 14px;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-footer {
    padding: 12px 20px;
    border-top: 1px solid #f0f0f0;
    text-align: right;
  }
}
</style>
