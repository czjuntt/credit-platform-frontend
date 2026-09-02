<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>案例管理</span>
          <el-button type="primary" @click="handleAdd">新增案例</el-button>
        </div>
      </template>

      <el-table :data="items" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="案例标题" show-overflow-tooltip />
        <el-table-column label="银行" width="150">
          <template #default="{ row }">{{ getBankName(row.bank_id) }}</template>
        </el-table-column>
        <el-table-column prop="amount" label="金额(万)" width="100" />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handleAudit(row)" v-if="row.status === 0">审核</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑案例' : '新增案例'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="案例标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="所属银行" prop="bank_id">
          <el-select v-model="form.bank_id" style="width: 100%" :disabled="isBankUser">
            <el-option v-for="bank in banks" :key="bank.id" :label="bank.bank_name" :value="bank.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额(万)">
          <el-input-number v-model="form.amount" :precision="2" />
        </el-form-item>
        <el-form-item label="行业">
          <el-input v-model="form.industry" placeholder="如：制造业、农业" />
        </el-form-item>
        <el-form-item label="案例描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="auditVisible" title="审核案例" width="500px">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCases, createCase, updateCase, deleteCase, auditCase, getBanks } from '../../api'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const items = ref([])
const banks = ref([])
const loading = ref(false)

const isBankUser = computed(() => {
  const perms = userStore.userInfo?.permissions || ''
  return perms === 'bank' || perms.includes('bank') || userStore.userInfo?.role_id === 3
})
const dialogVisible = ref(false)
const auditVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = ref({ id: null, title: '', bank_id: null, amount: 0, industry: '', description: '' })
const auditForm = ref({ id: null, status: 1, audit_remark: '' })

const rules = {
  title: [{ required: true, message: '请输入案例标题', trigger: 'blur' }],
  bank_id: [{ required: true, message: '请选择银行', trigger: 'change' }]
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
    const [itemsData, banksData] = await Promise.all([getCases(), getBanks()])
    items.value = itemsData
    banks.value = banksData
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  form.value = {
    title: '',
    bank_id: isBankUser.value ? userStore.userInfo?.bank_id : (banks.value[0]?.id || null),
    amount: 0, industry: '', description: ''
  }
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

function handleAudit(row) {
  auditForm.value = { id: row.id, status: 1, audit_remark: '' }
  auditVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateCase(form.value.id, form.value)
          ElMessage.success('更新成功')
        } else {
          await createCase({ ...form.value, create_user_id: 1 })
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (e) {
        console.error(e)
      }
    }
  })
}

async function submitAudit() {
  try {
    await auditCase(auditForm.value.id, {
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

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除 "${row.title}" 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteCase(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
