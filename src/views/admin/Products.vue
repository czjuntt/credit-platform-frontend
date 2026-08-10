<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>产品管理</span>
          <el-button type="primary" @click="handleAdd">新增产品</el-button>
        </div>
      </template>

      <el-table :data="items" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="产品名称" show-overflow-tooltip />
        <el-table-column label="银行" width="150">
          <template #default="{ row }">{{ getBankName(row.bank_id) }}</template>
        </el-table-column>
        <el-table-column prop="industry" label="行业" width="110" show-overflow-tooltip />
        <el-table-column prop="loan_rate" label="利率" width="100" />
        <el-table-column prop="loan_limit" label="额度" width="120" show-overflow-tooltip />
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

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑产品' : '新增产品'" width="800px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属银行" prop="bank_id">
              <el-select v-model="form.bank_id" style="width: 100%">
                <el-option v-for="bank in banks" :key="bank.id" :label="bank.bank_name" :value="bank.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属行业">
              <el-select v-model="form.industry" placeholder="选择行业" clearable style="width: 100%">
                <el-option v-for="ind in industryOptions" :key="ind" :label="ind" :value="ind" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类标签">
              <el-select v-model="form.label" placeholder="选择或输入标签" multiple filterable allow-create default-first-option style="width: 100%">
                <el-option v-for="tag in labelOptions" :key="tag" :label="tag" :value="tag" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品简介">
              <el-input v-model="form.summary" placeholder="产品简介" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="办理机构">
              <el-input v-model="form.branch" placeholder="办理机构" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="服务对象">
              <el-input v-model="form.servi_object" placeholder="服务对象" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="贷款金额">
              <el-input v-model="form.loan_limit" placeholder="如：10-500万" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="贷款利率">
              <el-input v-model="form.loan_rate" placeholder="如：年利率4.35%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="贷款期限">
              <el-input v-model="form.credit_period" placeholder="如：1-3年" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="担保方式">
              <el-input v-model="form.guaranty_style" placeholder="担保方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="贷款用途">
              <el-input v-model="form.loan_use" placeholder="贷款用途" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="还款方式">
              <el-input v-model="form.Repayment_Method" placeholder="还款方式" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人">
              <el-select v-model="form.contact_id" placeholder="选择联系人" clearable style="width: 100%">
                <el-option v-for="c in bankContacts" :key="c.id" :label="`${c.contact_name} (${c.position || ''})`" :value="c.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="申请条件" prop="conditions">
          <el-input v-model="form.conditions" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="办理流程">
          <el-input v-model="form.process" type="textarea" :rows="3" placeholder="详细描述办理流程" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="auditVisible" title="审核产品" width="500px">
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
import { getProducts, createProduct, updateProduct, deleteProduct, auditProduct, getBanks, getBankContacts } from '../../api'

const items = ref([])
const banks = ref([])
const bankContacts = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const auditVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const industryOptions = ['全行业', '小微企业', '个体工商户', '农业', '制造业', '服务业', '科技创新']
const labelOptions = ['经营贷款', '三农贷款', '低息', '信用', '抵押', '保证', '快速审批', '政府贴息', '短期', '中期', '长期']

const form = ref({
  id: null, name: '', bank_id: null, industry: '', label: '',
  summary: '', branch: '', servi_object: '', loan_limit: '',
  loan_rate: '', credit_period: '', guaranty_style: '',
  loan_use: '', Repayment_Method: '', conditions: '',
  process: '', contact_id: null
})
const auditForm = ref({ id: null, status: 1, audit_remark: '' })

const rules = {
  name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
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

async function loadBankContacts(bankId) {
  if (bankId) {
    try {
      bankContacts.value = await getBankContacts(bankId)
    } catch (e) {
      bankContacts.value = []
    }
  }
}

async function loadData() {
  loading.value = true
  try {
    const [itemsData, banksData] = await Promise.all([getProducts(), getBanks()])
    items.value = itemsData
    banks.value = banksData
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  form.value = {
    name: '', bank_id: banks.value[0]?.id || null,
    industry: '', label: [],
    summary: '', branch: '', servi_object: '', loan_limit: '',
    loan_rate: '', credit_period: '', guaranty_style: '',
    loan_use: '', Repayment_Method: '', conditions: '',
    process: '', contact_id: null
  }
  if (form.value.bank_id) {
    loadBankContacts(form.value.bank_id)
  }
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  form.value = {
    ...row,
    label: row.label ? row.label.split(',').map(s => s.trim()).filter(Boolean) : []
  }
  loadBankContacts(row.bank_id)
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
        const payload = {
          ...form.value,
          label: Array.isArray(form.value.label) ? form.value.label.join(',') : form.value.label
        }
        if (isEdit.value) {
          await updateProduct(form.value.id, payload)
          ElMessage.success('更新成功')
        } else {
          const { id, ...createData } = payload
          await createProduct(createData)
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
    await auditProduct(auditForm.value.id, {
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
  ElMessageBox.confirm(`确定删除 "${row.name}" 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteProduct(row.id)
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
