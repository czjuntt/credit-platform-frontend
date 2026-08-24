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
          <div class="filter-tabs">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'industry' }"
              @click="activeTab = 'industry'; activeFilters = []"
            >
              <el-icon><OfficeBuilding /></el-icon>
              按行业
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'label' }"
              @click="activeTab = 'label'; activeFilters = []"
            >
              <el-icon><Collection /></el-icon>
              按分类
            </button>
          </div>
          <div class="chip-row">
            <button
              v-for="item in currentOptions"
              :key="item"
              class="chip"
              :class="{ active: activeFilters.includes(item) }"
              @click="toggleFilter(item)"
            >
              {{ item }}
            </button>
          </div>
        </div>

        <div class="group-list" v-loading="loading">
          <div
            v-for="group in filteredGroups"
            :key="group.bankId"
            class="bank-group"
          >
            <div class="group-header" @click="toggleBank(group.bankId)">
              <span class="bank-name">{{ group.bankName }}</span>
              <span class="bank-count">{{ group.items.length }} 个产品</span>
              <el-icon class="arrow" :class="{ rotated: expandedBank === group.bankId }"><ArrowDown /></el-icon>
            </div>
            <transition name="expand">
              <div v-show="expandedBank === group.bankId" class="group-body">
                <div
                  v-for="(item, idx) in group.items"
                  :key="item.id"
                  class="row-item"
                  :class="{ expanded: expandedRow === item.id }"
                >
                  <div class="row-header" @click="toggleRow(item.id)">
                    <span class="row-num">{{ idx + 1 }}</span>
                    <span class="row-title">{{ item.name }}</span>
                    <el-tag size="small" type="warning" effect="plain" v-if="item.loan_rate">{{ item.loan_rate }}</el-tag>
                    <el-icon class="row-arrow" :class="{ rotated: expandedRow === item.id }"><ArrowDown /></el-icon>
                  </div>
                  <transition name="expand">
                    <div v-show="expandedRow === item.id" class="row-body">
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
                        <el-tag size="small" v-for="tag in parseLabels(item.label)" :key="tag" effect="light" round>{{ tag }}</el-tag>
                      </div>
                      <p class="row-summary" v-if="item.summary">{{ item.summary }}</p>
                      <el-button size="small" type="primary" link @click="goDetail(item.id)">查看详情 →</el-button>
                    </div>
                  </transition>
                </div>
              </div>
            </transition>
          </div>
          <el-empty v-if="filteredGroups.length === 0 && !loading" description="暂无产品信息" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, OfficeBuilding, Collection } from '@element-plus/icons-vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { getProducts, getBanks } from '../../api'

const router = useRouter()
const items = ref([])
const banks = ref([])
const loading = ref(false)
const activeTab = ref('industry')
const activeFilters = ref([])
const expandedBank = ref(null)
const expandedRow = ref(null)

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
    if (activeFilters.value.length >= 3) {
      activeFilters.value.shift()
    }
    activeFilters.value.push(item)
  }
}

function toggleBank(bankId) {
  expandedBank.value = expandedBank.value === bankId ? null : bankId
  expandedRow.value = null
}

function toggleRow(id) {
  expandedRow.value = expandedRow.value === id ? null : id
}

const filteredGroups = computed(() => {
  let data = items.value
  if (activeFilters.value.length > 0) {
    if (activeTab.value === 'industry') {
      if (!activeFilters.value.includes('全行业')) {
        data = data.filter(i => activeFilters.value.some(f => i.industry === f))
      }
    } else {
      data = data.filter(i => {
        const labels = parseLabels(i.label)
        return activeFilters.value.some(f => labels.includes(f))
      })
    }
  }

  const map = new Map()
  for (const item of data) {
    if (!map.has(item.bank_id)) {
      const bank = banks.value.find(b => b.id === item.bank_id)
      map.set(item.bank_id, { bankId: item.bank_id, bankName: bank?.bank_name || '未知', items: [] })
    }
    map.get(item.bank_id).items.push(item)
  }
  return Array.from(map.values())
})

function parseLabels(labelStr) {
  if (!labelStr) return []
  return labelStr.split(',').map(s => s.trim()).filter(Boolean)
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
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border: 1px solid #e8e8e8;
    border-radius: 20px;
    background: #fafafa;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.25s;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
    }

    &.active {
      background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
      color: #fff;
      border-color: #096dd9;
      box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
    }
  }
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .chip {
    padding: 6px 14px;
    border: 1px solid #e8e8e8;
    border-radius: 16px;
    background: #fff;
    color: #666;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.25s;

    &:hover {
      border-color: #1890ff;
      color: #1890ff;
      background: #f0f8ff;
    }

    &.active {
      background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
      color: #fff;
      border-color: #389e0d;
      box-shadow: 0 2px 6px rgba(82, 196, 26, 0.3);
    }
  }
}

.bank-group {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  gap: 12px;

  .bank-name {
    font-size: 16px;
    font-weight: 600;
    color: #1a365d;
    flex: 1;
  }

  .bank-count {
    font-size: 12px;
    color: #999;
    background: #f0f2f5;
    padding: 3px 10px;
    border-radius: 12px;
  }

  .arrow {
    transition: transform 0.3s;
    color: #ccc;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.group-body {
  padding: 0 12px 8px;

  .row-item {
    border-top: 1px solid #f5f5f5;
    transition: background 0.2s;

    &.expanded {
      background: #fafbfc;
    }
  }
}

.row-header {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  gap: 10px;

  .row-num {
    font-size: 13px;
    color: #bbb;
    min-width: 24px;
    text-align: right;
  }

  .row-title {
    font-size: 14px;
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
  padding: 4px 8px 14px 42px;

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
    font-size: 13px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 10px;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 600px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

@media (max-width: 768px) {
  .page-container {
    padding: 0 12px;
  }

  .filter-tabs .tab-btn {
    flex: 1;
    padding: 8px 12px;
    font-size: 13px;
  }

  .group-header {
    padding: 14px 16px;
  }

  .row-header {
    padding: 10px 4px;
    gap: 6px;
  }
}
</style>
