<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="page-header">
          <h1>信贷案例</h1>
          <p>真实成功案例参考</p>
        </div>

        <div class="filter-bar">
          <el-select v-model="selectedBank" placeholder="选择银行" clearable style="width: 200px">
            <el-option v-for="bank in banks" :key="bank.id" :label="bank.bank_name" :value="bank.id" />
          </el-select>
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
              <span class="row-title">{{ item.title }}</span>
              <span class="row-amount" v-if="item.amount">{{ item.amount }}万元</span>
              <el-icon class="row-arrow" :class="{ rotated: expandedId === item.id }"><ArrowDown /></el-icon>
            </div>
            <transition name="expand">
              <div v-show="expandedId === item.id" class="row-body">
                <div class="case-info" v-if="item.industry">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>行业：{{ item.industry }}</span>
                </div>
                <p class="row-desc">{{ item.description?.substring(0, 200) }}...</p>
                <el-button size="small" type="primary" link @click="goDetail(item.id)">查看详情 →</el-button>
              </div>
            </transition>
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
import { ArrowDown, OfficeBuilding } from '@element-plus/icons-vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { getCases, getBanks } from '../../api'

const router = useRouter()
const items = ref([])
const banks = ref([])
const loading = ref(false)
const selectedBank = ref(null)
const expandedId = ref(null)

const filteredItems = computed(() => {
  let data = items.value
  if (selectedBank.value) {
    data = data.filter(i => i.bank_id === selectedBank.value)
  }
  return data
})

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

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
  padding: 0 20px 16px 56px;

  .case-info {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #666;
    font-size: 13px;
    margin-bottom: 10px;
  }

  .row-desc {
    font-size: 14px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 10px;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
