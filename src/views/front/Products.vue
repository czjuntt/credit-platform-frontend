<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="page-header">
          <h1>普惠信贷产品</h1>
          <p>多家银行信贷产品对比</p>
        </div>

        <div class="filter-bar">
          <el-tabs v-model="activeTab" class="filter-tabs" stretch>
            <el-tab-pane label="按行业" name="industry" />
            <el-tab-pane label="按分类" name="label" />
          </el-tabs>
          <div class="chip-row">
            <el-chip
              v-for="item in currentOptions"
              :key="item"
              :type="activeFilters.includes(item) ? 'primary' : 'info'"
              :effect="activeFilters.includes(item) ? 'dark' : 'light'"
              @click="toggleFilter(item)"
            >
              {{ item }}
            </el-chip>
          </div>
        </div>

        <div class="product-list" v-loading="loading">
          <div class="product-card" v-for="item in filteredItems" :key="item.id" @click="goDetail(item.id)">
            <div class="card-header">
              <span class="bank-tag">{{ getBankName(item.bank_id) }}</span>
              <el-tag size="small" type="warning" v-if="item.loan_rate">{{ item.loan_rate }}</el-tag>
            </div>
            <div class="card-body">
              <h3>{{ item.name }}</h3>
              <div class="info-row" v-if="item.loan_limit">
                <span class="label">额度</span>
                <span class="value">{{ item.loan_limit }}</span>
              </div>
              <div class="info-row" v-if="item.credit_period">
                <span class="label">期限</span>
                <span class="value">{{ item.credit_period }}</span>
              </div>
              <div class="info-row" v-if="item.guaranty_style">
                <span class="label">担保</span>
                <span class="value">{{ item.guaranty_style }}</span>
              </div>
              <div class="label-tags" v-if="parseLabels(item.label).length">
                <el-tag size="small" v-for="tag in parseLabels(item.label)" :key="tag" class="label-tag">{{ tag }}</el-tag>
              </div>
              <p class="desc-preview" v-if="item.summary">{{ item.summary }}</p>
            </div>
            <div class="card-footer">
              <span class="view-detail">查看详情 →</span>
            </div>
          </div>
          <el-empty v-if="filteredItems.length === 0 && !loading" description="暂无产品信息" />
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
import { getProducts, getBanks } from '../../api'

const router = useRouter()
const items = ref([])
const banks = ref([])
const loading = ref(false)
const activeTab = ref('industry')
const activeFilters = ref([])

const INDUSTRY_OPTIONS = ['全行业', '小微企业', '个体工商户', '农业', '制造业', '服务业', '科技创新']
const LABEL_OPTIONS = ['经营贷款', '三农贷款', '低息', '信用', '抵押', '保证', '快速审批', '政府贴息', '短期', '中期', '长期']

const currentOptions = computed(() => {
  return activeTab.value === 'industry' ? INDUSTRY_OPTIONS : LABEL_OPTIONS
})

function toggleFilter(item) {
  const idx = activeFilters.value.indexOf(item)
  if (idx >= 0) {
    activeFilters.value.splice(idx, 1)
  } else {
    const options = currentOptions.value
    if (activeFilters.value.length >= 3) {
      activeFilters.value.shift()
    }
    activeFilters.value.push(item)
  }
}

const filteredItems = computed(() => {
  let data = items.value
  if (activeFilters.value.length === 0) return data
  
  if (activeTab.value === 'industry') {
    if (activeFilters.value.includes('全行业')) return data
    data = data.filter(i => activeFilters.value.some(f => i.industry === f))
  } else {
    data = data.filter(i => {
      const labels = parseLabels(i.label)
      return activeFilters.value.some(f => labels.includes(f))
    })
  }
  return data
})

function parseLabels(labelStr) {
  if (!labelStr) return []
  return labelStr.split(',').map(s => s.trim()).filter(Boolean)
}

function getBankName(bankId) {
  const bank = banks.value.find(b => b.id === bankId)
  return bank?.bank_name || '未知'
}

function goDetail(id) {
  router.push(`/products/${id}`)
}

async function loadData() {
  loading.value = true
  try {
    const [itemsData, banksData] = await Promise.all([
      getProducts({ status: 1 }),
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
  padding: 20px 0;
}

.page-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;

  h1 {
    font-size: 22px;
    color: #1a365d;
    margin-bottom: 4px;
  }

  p {
    color: #999;
    font-size: 14px;
  }
}

.filter-bar {
  background: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-tabs {
  :deep(.el-tabs__nav) {
    border: none;
    gap: 8px;
  }
  :deep(.el-tabs__item) {
    font-size: 15px;
    font-weight: 500;
    padding: 8px 20px;
    border-radius: 20px;
    background: #f0f2f5;
    color: #666;
    height: auto;
    line-height: 1.4;
  }
  :deep(.el-tabs__item.is-active) {
    background: #1890ff;
    color: #fff;
  }
  :deep(.el-tabs__active-bar) {
    display: none;
  }
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  &:active {
    transform: scale(0.98);
  }

  .card-header {
    background: linear-gradient(135deg, #667eea, #764ba2);
    padding: 10px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .bank-tag {
      color: #fff;
      font-size: 13px;
    }
  }

  .card-body {
    padding: 16px;

    h3 {
      font-size: 17px;
      color: #333;
      margin-bottom: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;

      .label {
        color: #999;
        font-size: 13px;
      }

      .value {
        color: #333;
        font-size: 14px;
        font-weight: 500;
      }
    }

    .label-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: 8px 0;

      .label-tag {
        font-size: 12px;
      }
    }

    .desc-preview {
      color: #999;
      font-size: 13px;
      margin-top: 8px;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .card-footer {
    padding: 10px 16px;
    border-top: 1px solid #f0f0f0;
    text-align: right;

    .view-detail {
      color: #1890ff;
      font-size: 13px;
    }
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 0 12px;
  }

  .product-list {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    :deep(.el-tabs__item) {
      flex: 1;
      padding: 8px 12px;
      font-size: 14px;
    }
  }
}
</style>
