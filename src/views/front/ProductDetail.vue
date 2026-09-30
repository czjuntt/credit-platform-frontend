<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="detail-header">
          <button class="back-btn" @click="goBack">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>返回</span>
          </button>
        </div>
        <div class="detail-card" v-loading="loading">
          <template v-if="detail">
            <div class="product-highlight">
              <div class="highlight-item" v-if="detail.loan_rate">
                <span class="label">年利率</span>
                <span class="value rate">{{ detail.loan_rate }}</span>
              </div>
              <div class="highlight-item" v-if="detail.loan_limit">
                <span class="label">贷款额度</span>
                <span class="value">{{ detail.loan_limit }}</span>
              </div>
              <div class="highlight-item" v-if="detail.credit_period">
                <span class="label">贷款期限</span>
                <span class="value">{{ detail.credit_period }}</span>
              </div>
            </div>

            <div class="detail-title">{{ detail.name }}</div>
            <div class="detail-meta">
              <span class="meta-item">
                <el-icon><OfficeBuilding /></el-icon>
                {{ getBankName(detail.bank_id) }}
              </span>
              <span class="meta-item" v-if="detail.branch">
                <el-icon><Location /></el-icon>
                {{ detail.branch }}
              </span>
            </div>

            <div class="detail-section" v-if="detail.summary">
              <h4>产品简介</h4>
              <p>{{ detail.summary }}</p>
            </div>

            <el-descriptions :column="1" border v-if="hasBasicInfo" class="info-table">
              <el-descriptions-item label="服务对象" v-if="detail.servi_object">{{ detail.servi_object }}</el-descriptions-item>
              <el-descriptions-item label="贷款用途" v-if="detail.loan_use">{{ detail.loan_use }}</el-descriptions-item>
              <el-descriptions-item label="担保方式" v-if="detail.guaranty_style">{{ detail.guaranty_style }}</el-descriptions-item>
              <el-descriptions-item label="还款方式" v-if="repaymentMethod">{{ repaymentMethod }}</el-descriptions-item>
            </el-descriptions>

            <div class="detail-section" v-if="detail.conditions">
              <h4>申请条件</h4>
              <div v-html="formattedConditions"></div>
            </div>

            <div class="detail-section" v-if="detail.process">
              <h4>办理流程</h4>
              <div v-html="formattedProcess"></div>
            </div>

            <div class="detail-section" v-if="detail.remark">
              <h4>产品备注</h4>
              <p>{{ detail.remark }}</p>
            </div>

            <div class="detail-section" v-if="contactsList.length">
              <h4>联系人</h4>
              <div class="contact-list">
                <div v-for="c in contactsList" :key="c.id" class="contact-card">
                  <div class="contact-line" v-if="contactName(c)">
                    <span class="c-label">姓名</span>
                    <span class="c-value">{{ contactName(c) }}</span>
                  </div>
                  <div class="contact-line" v-if="c.position">
                    <span class="c-label">部门职务</span>
                    <span class="c-value">{{ c.position }}</span>
                  </div>
                  <div class="contact-line" v-if="contactPhones(c).length">
                    <span class="c-label">联系电话</span>
                    <span class="c-value">
                      <template v-for="(p, i) in contactPhones(c)" :key="p">
                        <span v-if="i > 0" class="phone-sep">、</span>
                        <a class="tel-link" :href="telHref(p)">{{ p }}</a>
                      </template>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <el-empty v-else-if="!loading" description="未找到内容" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { getProduct, getBanks, getBankContacts } from '../../api'

const route = useRoute()
const router = useRouter()
const detail = ref(null)
const banks = ref([])
const bankContacts = ref([])
const loading = ref(false)

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/products')
  }
}

const repaymentMethod = computed(() => {
  return detail.value?.Repayment_Method || detail.value?.repayment_method || ''
})

const hasBasicInfo = computed(() => {
  return detail.value && (detail.value.servi_object || detail.value.loan_use || detail.value.guaranty_style || repaymentMethod.value)
})

function parseContactIds(raw) {
  if (raw === null || raw === undefined) return []
  if (Array.isArray(raw)) {
    return raw.map(Number).filter(n => Number.isFinite(n) && n > 0)
  }
  const str = String(raw).trim()
  if (!str) return []
  try {
    const parsed = JSON.parse(str)
    if (Array.isArray(parsed)) {
      return parsed.map(Number).filter(n => Number.isFinite(n) && n > 0)
    }
    if (parsed !== null && parsed !== undefined) {
      const n = Number(parsed)
      return Number.isFinite(n) && n > 0 ? [n] : []
    }
  } catch {
    // 非 JSON，按分隔符解析
  }
  return str
    .split(/[,，;；\s]+/)
    .map(t => Number(t.trim()))
    .filter(n => Number.isFinite(n) && n > 0)
}

const contactsList = computed(() => {
  if (!detail.value) return []
  let ids = parseContactIds(detail.value.contacts)
  if (!ids.length) ids = parseContactIds(detail.value.contact_id)
  if (!ids.length) return []
  return ids.map(id => bankContacts.value.find(c => c.id === id)).filter(Boolean)
})

function contactName(c) {
  return c.contact_name || c.name || ''
}

function contactPhones(c) {
  return [c.phone, c.mobile]
    .filter((v, i, arr) => v && arr.indexOf(v) === i)
    .map(v => String(v))
}

function telHref(phone) {
  return 'tel:' + phone.replace(/\s+/g, '')
}

const formattedConditions = computed(() => {
  if (!detail.value?.conditions) return ''
  return detail.value.conditions.replace(/\n/g, '<br>')
})

const formattedProcess = computed(() => {
  if (!detail.value?.process) return ''
  return detail.value.process.replace(/\n/g, '<br>')
})

function getBankName(bankId) {
  const bank = banks.value.find(b => b.id === bankId)
  return bank?.bank_name || '未知'
}

async function loadDetail() {
  loading.value = true
  try {
    const id = route.params.id
    const [product, banksData] = await Promise.all([
      getProduct(id),
      getBanks()
    ])
    detail.value = product
    banks.value = banksData
    if (product?.bank_id) {
      try {
        bankContacts.value = await getBankContacts(product.bank_id)
      } catch (e) {
        bankContacts.value = []
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(loadDetail)
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

.detail-header {
  margin-bottom: 16px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    background: #f0f0f0;
    transform: scale(0.96);
  }
}

.detail-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.product-highlight {
  display: flex;
  gap: 40px;
  padding: 24px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;

  .highlight-item {
    text-align: center;
    color: #fff;
    flex: 1;
    min-width: 120px;

    .label {
      display: block;
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 8px;
    }

    .value {
      font-size: 24px;
      font-weight: bold;

      &.rate {
        font-size: 32px;
      }
    }
  }
}

.detail-title {
  font-size: 24px;
  font-weight: bold;
  color: #1a365d;
  margin-bottom: 12px;
}

.detail-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #999;
    font-size: 14px;
  }
}

.info-table {
  margin-bottom: 24px;

  :deep(.el-descriptions__body) {
    table-layout: fixed;
    width: 100%;
  }

  :deep(.el-descriptions__label) {
    width: 96px;
    white-space: nowrap;
    vertical-align: middle;
  }

  :deep(.el-descriptions__content) {
    overflow-wrap: anywhere;
    word-break: break-word;
    vertical-align: middle;
  }
}

.detail-section {
  margin-bottom: 24px;

  h4 {
    font-size: 16px;
    margin-bottom: 12px;
    color: #333;
    padding-left: 12px;
    border-left: 3px solid #1890ff;
  }

  p, div {
    color: #666;
    font-size: 15px;
    line-height: 1.8;
  }
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-card {
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #f0f0f0;

  .contact-line {
    display: flex;
    align-items: baseline;
    gap: 12px;
    font-size: 14px;
    line-height: 1.9;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .c-label {
    flex: none;
    width: 64px;
    color: #999;
    font-size: 13px;
  }

  .c-value {
    flex: 1;
    min-width: 0;
    color: #333;
    word-break: break-word;
  }

  .tel-link {
    color: #1890ff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .phone-sep {
    color: #bbb;
    margin-right: 4px;
  }
}

@media (max-width: 768px) {
  .product-highlight {
    flex-direction: column;
    gap: 20px;
  }

  .info-table {
    :deep(.el-descriptions__body .el-descriptions__table .el-descriptions__cell) {
      padding: 8px;
    }

    :deep(.el-descriptions__label) {
      width: 80px;
    }
  }
}
</style>
