<template>
  <div class="dashboard">
    <el-row :gutter="16">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: #1890ff"><el-icon :size="24"><User /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.users }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: #52c41a"><el-icon :size="24"><OfficeBuilding /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.banks }}</div>
              <div class="stat-label">银行数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: #faad14"><el-icon :size="24"><Document /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.policies }}</div>
              <div class="stat-label">政策文件</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f5222d"><el-icon :size="24"><Clock /></el-icon></div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <span class="card-title">欢迎使用</span>
          </template>
          <div class="welcome">
            <p>欢迎使用 <strong>金昌市银行业协会普惠金融信贷服务平台</strong> 管理后台！</p>
            <p>本系统用于管理普惠金融相关的政策、产品、流程、案例等内容。</p>
            <p class="tips">💡 使用提示：银行用户提交的内容需要审核员审核通过后才能在前台展示。</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, getBanks, getPolicies, getProducts, getCases } from '../../api'

const stats = ref({
  users: 0,
  banks: 0,
  policies: 0,
  pending: 0
})

async function loadStats() {
  try {
    const [users, banks, policies, products, cases] = await Promise.all([
      getUsers(),
      getBanks(),
      getPolicies(),
      getProducts(),
      getCases()
    ])
    stats.value.users = users.length
    stats.value.banks = banks.length
    stats.value.policies = policies.length
    const allItems = [...products, ...cases]
    stats.value.pending = allItems.filter(i => i.status === 0).length + 
      policies.filter(i => i.status === 0).length
  } catch (e) {
    console.error(e)
  }
}

onMounted(loadStats)
</script>

<style scoped lang="scss">
.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .stat-info {
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .stat-label {
      font-size: 14px;
      color: #999;
    }
  }
}

.card-title {
  font-size: 16px;
  font-weight: bold;
}

.welcome {
  p {
    margin: 8px 0;
    color: #666;
  }

  .tips {
    margin-top: 16px;
    padding: 12px;
    background: #fffbe6;
    border-radius: 4px;
    color: #faad14;
  }
}
</style>
