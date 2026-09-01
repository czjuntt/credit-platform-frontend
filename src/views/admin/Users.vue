<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名">
          <template #default="{ row }">
            {{ row.username }}
            <el-tag v-if="row.id === 1" size="small" type="warning" class="system-tag">系统账号</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="real_name" label="真实姓名" />
        <el-table-column label="角色">
          <template #default="{ row }">
            {{ getRoleName(row.role_id) }}
          </template>
        </el-table-column>
        <el-table-column label="所属机构" width="160">
          <template #default="{ row }">{{ getBankName(row.bank_id) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handleResetPassword(row)">重置密码</el-button>
            <el-button
              size="small"
              type="danger"
              :disabled="row.id === 1"
              @click="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username" v-if="!isEdit">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="form.real_name" />
        </el-form-item>
        <el-form-item label="角色" prop="role_id">
          <el-select v-model="form.role_id" style="width: 100%">
            <el-option v-for="role in roles" :key="role.id" :label="role.role_name" :value="role.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属机构" prop="bank_id" v-if="isBankRole">
          <el-select v-model="form.bank_id" style="width: 100%" placeholder="请选择银行">
            <el-option v-for="bank in banks" :key="bank.id" :label="bank.bank_name" :value="bank.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resetDialogVisible" title="重置密码" width="420px">
      <p style="margin-bottom:16px;color:#666">为用户 <b>{{ resetForm.username }}</b> 设置新密码</p>
      <el-form :model="resetForm" :rules="resetRules" ref="resetFormRef" label-width="80px">
        <el-form-item label="新密码" prop="new_password">
          <el-input v-model="resetForm.new_password" type="password" show-password placeholder="至少6位" />
        </el-form-item>
        <el-form-item label="确认" prop="confirm_password">
          <el-input v-model="resetForm.confirm_password" type="password" show-password placeholder="再次输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResetSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, createUser, updateUser, resetUserPassword, deleteUser, getRoles, getBanks } from '../../api'

const users = ref([])
const roles = ref([])
const banks = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = ref({
  id: null,
  username: '',
  password: '',
  real_name: '',
  role_id: 3,
  bank_id: null,
  status: 1
})

const isBankRole = computed(() => {
  const role = roles.value.find(r => r.id === form.value.role_id)
  if (!role) return false
  return role.permissions === 'bank' || (role.permissions && role.permissions.includes('bank'))
})

function getBankName(bankId) {
  const bank = banks.value.find(b => b.id === bankId)
  return bank?.bank_name || '-'
}

const resetDialogVisible = ref(false)
const resetFormRef = ref(null)
const resetForm = ref({ id: null, username: '', new_password: '', confirm_password: '' })
const resetRules = {
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '至少6位', trigger: 'blur' }
  ],
  confirm_password: [
    { required: true, message: '请再次输入', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.value.new_password) callback(new Error('两次密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  real_name: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  role_id: [{ required: true, message: '请选择角色', trigger: 'change' }],
  bank_id: [{
    validator: (rule, value, callback) => {
      if (isBankRole.value && !value) callback(new Error('请选择所属机构'))
      else callback()
    },
    trigger: 'change'
  }]
}

function getRoleName(roleId) {
  const role = roles.value.find(r => r.id === roleId)
  return role ? role.role_name : '未知'
}

async function loadData() {
  loading.value = true
  try {
    const [usersData, rolesData, banksData] = await Promise.all([getUsers(), getRoles(), getBanks()])
    users.value = usersData
    roles.value = rolesData
    banks.value = banksData
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  form.value = { username: '', password: '', real_name: '', role_id: 3, bank_id: null, status: 1 }
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  form.value = { ...row, password: '' }
  dialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          if (form.value.id === 1 && form.value.role_id !== 1) {
            ElMessage.warning('超级管理员角色不可更改')
            return
          }
          const { password, ...updateData } = form.value
          await updateUser(form.value.id, updateData)
          ElMessage.success('更新成功')
        } else {
          await createUser(form.value)
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
  if (row.id === 1) {
    ElMessage.warning('系统账号不可删除')
    return
  }
  ElMessageBox.confirm(`确定删除用户 "${row.username}" 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {})
}

function handleResetPassword(row) {
  resetForm.value = { id: row.id, username: row.username, new_password: '', confirm_password: '' }
  resetDialogVisible.value = true
}

async function handleResetSubmit() {
  if (!resetFormRef.value) return
  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await resetUserPassword(resetForm.value.id, { new_password: resetForm.value.new_password })
        ElMessage.success('密码重置成功')
        resetDialogVisible.value = false
      } catch (e) {
        console.error(e)
      }
    }
  })
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.system-tag {
  margin-left: 6px;
}
</style>
