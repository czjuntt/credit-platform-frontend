<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>审核管理</span>
          <div>
            <el-select v-model="activeTab" style="width: 150px; margin-right: 12px">
              <el-option label="全部类型" value="all" />
              <el-option label="政策" value="policy" />
              <el-option label="产品" value="product" />
              <el-option label="案例" value="case" />
            </el-select>
            <el-select v-model="statusFilter" style="width: 120px">
              <el-option label="全部状态" :value="null" />
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="filteredItems" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeColor(row.type)">{{ getTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column label="银行" width="150">
          <template #default="{ row }">{{ getBankName(row.bank_id) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="提交时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button size="small" type="warning" @click="handleAudit(row)" v-if="row.status === 0">审核</el-button>
            <el-button size="small" @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="auditVisible" title="审核" width="500px">
      <div class="audit-preview" v-if="currentItem">
        <h4>{{ currentItem.title }}</h4>
        <p>{{ currentItem.content || currentItem.description || currentItem.conditions || '无详细内容' }}</p>
      </div>
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审核结果">
          <el-radio-group v-model="auditForm.status">
            <el-radio :value="1">通过</el-radio>
            <el-radio :value="2">驳回</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="auditForm.audit_remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="auditVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAudit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="viewVisible" title="查看详情" width="600px">
      <div class="view-content" v-if="currentItem">
        <h3>{{ currentItem.title }}</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="类型">{{ getTypeName(currentItem.type) }}</el-descriptions-item>
          <el-descriptions-item label="银行">{{ getBankName(currentItem.bank_id) }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ getStatusText(currentItem.status) }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentItem.create_time }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ currentItem.content || currentItem.description || currentItem.conditions || '暂无内容' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getPolicies, getProducts, getCases,
  auditPolicy, auditProduct, auditCase,
  getBanks
} from '../../api'

const loading = ref(false)
const activeTab = ref('all')
const statusFilter = ref(null)
const auditVisible = ref(false)
const viewVisible = ref(false)
const currentItem = ref(null)
const auditForm = ref({ id: null, type: '', status: 1, audit_remark: '' })

const allItems = ref([])
const banks = ref([])

const filteredItems = computed(() => {
  let items = allItems.value
  if (activeTab.value !== 'all') {
    items = items.filter(i => i.type === activeTab.value)
  }
  if (statusFilter.value !== null) {
    items = items.filter(i => i.status === statusFilter.value)
  }
  return items
})

function getTypeName(type) {
  return { policy: '政策', product: '产品', case: '案例' }[type] || type
}

function getTypeColor(type) {
  return { policy: 'blue', product: 'green', case: 'purple' }[type] || 'info'
}

function getBankName(bankId) {
  const bank = banks.value.find(b => b.id === bankId)
  return bank?.bank_name || '未知'
}

function getStatusText(status) {
  return { 0: '待审核', 1: '已通过', 2: '已驳回' }[status] || '未知'
}

function getStatusType(status) {
  return { 0: 'warning', 1: 'success', 2: 'danger' }[status] || 'info'
}

async function loadData() {
  loading.value = true
  try {
    const [policies, products, cases, banksData] = await Promise.all([
      getPolicies(), getProducts(), getCases(), getBanks()
    ])
    banks.value = banksData
    allItems.value = [
      ...policies.map(i => ({ ...i, type: 'policy' })),
      ...products.map(i => ({ ...i, type: 'product' })),
      ...cases.map(i => ({ ...i, type: 'case' }))
    ].sort((a, b) => b.create_time?.localeCompare(a.create_time) || 0)
  } finally {
    loading.value = false
  }
}

function handleAudit(row) {
  currentItem.value = row
  auditForm.value = { id: row.id, type: row.type, status: 1, audit_remark: '' }
  auditVisible.value = true
}

function handleView(row) {
  currentItem.value = row
  viewVisible.value = true
}

async function submitAudit() {
  try {
    const apiMap = {
      policy: auditPolicy,
      product: auditProduct,
      case: auditCase
    }
    await apiMap[auditForm.value.type](auditForm.value.id, {
      status: auditForm.value.status,
      audit_remark: auditForm.value.audit_remark
    })
    ElMessage.success('审核成功')
    auditVisible.value = false
    loadData()
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.audit-preview {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;

  h4 {
    margin-bottom: 8px;
    color: #333;
  }

  p {
    color: #666;
    white-space: pre-wrap;
    max-height: 150px;
    overflow: hidden;
  }
}

.view-content {
  h3 {
    margin-bottom: 16px;
  }
}
</style>
