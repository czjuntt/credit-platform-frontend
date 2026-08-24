<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="page-header">
          <h1>信贷案例</h1>
          <p>真实成功案例参考</p>
        </div>

        <div class="group-list" v-loading="loading">
          <div
            v-for="group in groupedItems"
            :key="group.bankId"
            class="bank-group"
          >
            <div class="group-header" @click="toggleBank(group.bankId)">
              <span class="bank-name">{{ group.bankName }}</span>
              <span class="bank-count">{{ group.items.length }} 个案例</span>
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
                    <span class="row-title">{{ item.title }}</span>
                    <span class="row-amount" v-if="item.amount">{{ item.amount }}万元</span>
                    <el-icon class="row-arrow" :class="{ rotated: expandedRow === item.id }"><ArrowDown /></el-icon>
                  </div>
                  <transition name="expand">
                    <div v-show="expandedRow === item.id" class="row-body">
                      <div class="case-info" v-if="item.industry">
                        <el-icon><OfficeBuilding /></el-icon>
                        <span>行业：{{ item.industry }}</span>
                      </div>
                      <p class="row-desc">{{ item.description?.substring(0, 200) }}...</p>
                      <el-button size="small" type="primary" link @click="goDetail(item.id)">查看详情 →</el-button>
                    </div>
                  </transition>
                </div>
              </div>
            </transition>
          </div>
          <el-empty v-if="groupedItems.length === 0 && !loading" description="暂无案例信息" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowDown, OfficeBuilding } from '@element-plus/icons-vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { getCases, getBanks } from '../../api'

const router = useRouter()
const items = ref([])
const banks = ref([])
const loading = ref(false)
const expandedBank = ref(null)
const expandedRow = ref(null)

const groupedItems = computed(() => {
  const map = new Map()
  for (const item of items.value) {
    if (!map.has(item.bank_id)) {
      const bank = banks.value.find(b => b.id === item.bank_id)
      map.set(item.bank_id, { bankId: item.bank_id, bankName: bank?.bank_name || '未知', items: [] })
    }
    map.get(item.bank_id).items.push(item)
  }
  return Array.from(map.values())
})

function toggleBank(bankId) {
  expandedBank.value = expandedBank.value === bankId ? null : bankId
  expandedRow.value = null
}

function toggleRow(id) {
  expandedRow.value = expandedRow.value === id ? null : id
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

  .row-amount {
    font-size: 13px;
    color: #f5222d;
    font-weight: 600;
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

  .case-info {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #666;
    font-size: 13px;
    margin-bottom: 10px;
  }

  .row-desc {
    font-size: 13px;
    color: #666;
    line-height: 1.7;
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
</style>
