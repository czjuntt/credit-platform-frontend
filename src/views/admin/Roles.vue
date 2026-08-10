<template>
  <div class="page-container">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd">新增角色</el-button>
        </div>
      </template>

      <el-table :data="roles" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="角色名称">
          <template #default="{ row }">
            {{ row.role_name }}
            <el-tag v-if="row.id === 1" size="small" type="warning" class="system-tag">系统角色</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="permissions" label="权限" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button size="small" :disabled="row.id === 1" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="角色名称" prop="role_name">
          <el-input v-model="form.role_name" :disabled="isEdit && form.id === 1" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-input v-model="form.permissions" type="textarea" :rows="3" placeholder="用逗号分隔，如：upload,audit,edit" :disabled="isEdit && form.id === 1" />
        </el-form-item>
        <el-alert
          v-if="isEdit && form.id === 1"
          title="超级管理员角色为系统角色，不可修改"
          type="warning"
          :closable="false"
          show-icon
        />
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :disabled="isEdit && form.id === 1">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRoles, createRole, updateRole } from '../../api'

const roles = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const form = ref({ id: null, role_name: '', permissions: '' })

const rules = {
  role_name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

async function loadData() {
  loading.value = true
  try {
    roles.value = await getRoles()
  } finally {
    loading.value = false
  }
}

function handleAdd() {
  isEdit.value = false
  form.value = { role_name: '', permissions: '' }
  dialogVisible.value = true
}

function handleEdit(row) {
  if (row.id === 1) {
    ElMessage.warning('系统角色不可修改')
    return
  }
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
          if (form.value.id === 1) {
            ElMessage.warning('系统角色不可修改')
            return
          }
          await updateRole(form.value.id, form.value)
          ElMessage.success('更新成功')
        } else {
          await createRole(form.value)
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
