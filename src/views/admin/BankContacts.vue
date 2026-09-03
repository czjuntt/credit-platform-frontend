<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <div>
            <el-button size="small" @click="$router.back()">返回</el-button>
            <span class="title">{{ bankName }} - 联系人管理</span>
          </div>
          <el-button type="primary" @click="handleAdd">新增联系人</el-button>
        </div>
      </template>

      <el-table :data="contacts" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="contact_name" label="联系人" />
        <el-table-column prop="position" label="职务" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="mobile" label="手机" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="sort_order" label="排序" width="80" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑联系人' : '新增联系人'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="联系人" prop="contact_name">
          <el-input v-model="form.contact_name" />
        </el-form-item>
        <el-form-item label="职务" prop="position">
          <el-input v-model="form.position" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="form.mobile" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBankContacts, createBankContact, updateBankContact, deleteBankContact, getBanks } from '../../api'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isBankUser = computed(() => {
  const perms = userStore.userInfo?.permissions || ''
  return perms === 'bank' || perms.includes('bank') || userStore.userInfo?.role_id === 3
})

const bankId = computed(() => {
  if (isBankUser.value && userStore.userInfo?.bank_id) {
    return String(userStore.userInfo.bank_id)
  }
  return route.params.bankId
})
const contacts = ref([])
const bankName = ref('')
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = ref({
  id: null,
  contact_name: '',
  position: '',
  phone: '',
  mobile: '',
  email: '',
  sort_order: 0
})

const rules = {
  contact_name: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }]
}

async function loadData() {
  // 银行用户如果访问非本银行的联系人页面，强制跳转
  if (isBankUser.value && userStore.userInfo?.bank_id && route.params.bankId) {
    const targetBankId = Number(route.params.bankId)
    if (targetBankId !== userStore.userInfo.bank_id) {
      router.replace(`/admin/bank-contacts/${userStore.userInfo.bank_id}`)
      return
    }
  }
  loading.value = true
  try {
    const [contactsData, banks] = await Promise.all([
      getBankContacts(bankId.value),
      getBanks()
    ])
    contacts.value = contactsData
    const bank = banks.find(b => b.id === Number(bankId.value))
    bankName.value = bank?.bank_name || ''
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  form.value = { contact_name: '', position: '', phone: '', mobile: '', email: '', sort_order: 0 }
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  form.value = { ...row }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await updateBankContact(form.value.id, form.value)
          ElMessage.success('更新成功')
        } else {
          await createBankContact(bankId.value, form.value)
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

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除联系人 "${row.contact_name}" 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteBankContact(row.id)
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

.title {
  margin-left: 12px;
  font-size: 16px;
  font-weight: bold;
}
</style>
