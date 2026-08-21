<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="page-header">
          <h1>信贷产品</h1>
          <p>全市银行产品全览</p>
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

        <div class="row-list" v-loading="loading">
          <div
            v-for="(item, idx) in filteredItems"
            :key="item.id"
            class="row-item"
            :class="{ expanded: expandedId === item.id }"
          >
            <div class="row-header" @click="toggleExpand(item.id)">
              <span class="row-num">{{ idx + 1 }}</span>
              <span class="row-bank">{{ getBankName(item.bank_id) }}</span>
              <span class="row-title">{{ item.name }}</span>
              <el-tag size="small" type="warning" v-if="item.loan_rate">{{ item.loan_rate }}</el-tag>
              <el-icon class="row-arrow" :class="{ rotated: expandedId === item.id }"><ArrowDown /></el-icon>
            </div>
            <transition name="expand">
              <div v-show="expandedId === item.id" class="row-body">
                <div class="info-grid">
                  <div class="info-cell" v-if="item.loan_limit">
                    <span class="label">额度</span>
                    <span class="value">{{ item.loan_limit }}</span>
                  </div>
                  <div class="info-cell" v-if="item.credit_period">
                    <span class="label">期限</span>
                    <span class="value">{{ item.credit_period }}</span>
                  </div>
                  <div class="info-cell" v-if="item.guaranty_style">
                    <span class="label">担保</span>
                    <span class="value">{{ item.guaranty_style }}</span>
                  </div>
                </div>
                <div class="label-tags" v-if="parseLabels(item.label).length">
                  <el-tag size="small" v-for="tag in parseLabels(item.label)" :key="tag">{{ tag }}</el-tag>
                </div>
                <p class="row-summary" v-if="item.summary">{{ item.summary }}</p>
                <el-button size="small" type="primary" link @click="goDetail(item.id)">查看详情 →</el-button>
              </div>
            </transition>
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
import { ArrowDown } from '@element-plus/icons-vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { getProducts, getBanks } from '../../api'

const router = useRouter()
const items = ref([])
const banks = ref([])
const loading = ref(false)
const activeTab = ref('industry')
const activeFilters = ref([])
const expandedId = ref(null)

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

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
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
  max-width: 1000px;
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

.row-list {
  .row-item {
    background: #fff;
    border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: box-shadow 0.3s;

    &.expanded {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

.row-header {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  cursor: pointer;
  gap: 12px;

  .row-num {
    font-size: 14px;
    color: #bbb;
    min-width: 28px;
    text-align: right;
    font-weight: 500;
  }

  .row-bank {
    font-size: 12px;
    color: #1890ff;
    background: #e6f7ff;
    padding: 3px 10px;
    border-radius: 12px;
    white-space: nowrap;
  }

  .row-title {
    font-size: 15px;
    color: #333;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-arrow {
    transition: transform 0.3s;
    color: #ccc;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.row-body {
  padding: 0 20px 16px 56px;

  .info-grid {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .info-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .label {
      font-size: 12px;
      color: #aaa;
    }

    .value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  }

  .label-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 10px;
  }

  .row-summary {
    font-size: 14px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 10px;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

@media (max-width: 768px) {
  .page-container {
    padding: 0 12px;
  }

  .filter-tabs {
    :deep(.el-tabs__item) {
      flex: 1;
      padding: 8px 12px;
      font-size: 14px;
    }
  }

  .row-header {
    padding: 12px 14px;
    gap: 8px;

    .row-num {
      min-width: 20px;
    }
  }

  .row-body {
    padding: 0 14px 14px 40px;
  }
}
</style>
