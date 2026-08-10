<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="page-header">
          <h1>咨询电话</h1>
          <p>各银行联系电话，欢迎咨询</p>
        </div>

        <div class="banks-grid" v-loading="loading">
          <div class="bank-card" v-for="bank in banks" :key="bank.id">
            <div class="bank-header">
              <div class="bank-logo">{{ bank.bank_name.charAt(0) }}</div>
              <h3>{{ bank.bank_name }}</h3>
            </div>
            <div class="bank-contacts">
              <div class="contact-item" v-for="contact in getContacts(bank.id)" :key="contact.id">
                <div class="contact-info">
                  <span class="contact-name">{{ contact.contact_name }}</span>
                  <span class="contact-position" v-if="contact.position">{{ contact.position }}</span>
                </div>
                <div class="contact-methods">
                  <a v-if="contact.phone" :href="'tel:' + contact.phone" class="contact-phone">
                    <el-icon><Phone /></el-icon>
                    {{ contact.phone }}
                  </a>
                  <a v-if="contact.mobile" :href="'tel:' + contact.mobile" class="contact-mobile">
                    <el-icon><Iphone /></el-icon>
                    {{ contact.mobile }}
                  </a>
                  <a v-if="contact.email" :href="'mailto:' + contact.email" class="contact-email">
                    <el-icon><Message /></el-icon>
                    {{ contact.email }}
                  </a>
                </div>
              </div>
              <div class="no-contacts" v-if="getContacts(bank.id).length === 0">
                <p>暂无联系人信息</p>
              </div>
            </div>
          </div>
        </div>
        <el-empty v-if="banks.length === 0 && !loading" description="暂无银行信息" />
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { getBanks, getBankContacts } from '../../api'

const banks = ref([])
const contactsMap = ref({})
const loading = ref(false)

function getContacts(bankId) {
  return contactsMap.value[bankId] || []
}

async function loadData() {
  loading.value = true
  try {
    const banksData = await getBanks({ status: 1 })
    banks.value = banksData

    const contactsPromises = banksData.map(async (bank) => {
      const contacts = await getBankContacts(bank.id)
      contactsMap.value[bank.id] = contacts
    })
    await Promise.all(contactsPromises)
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
  max-width: 1100px;
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

.banks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.bank-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);

  .bank-header {
    background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 12px;

    .bank-logo {
      width: 44px;
      height: 44px;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
    }

    h3 {
      color: #fff;
      font-size: 16px;
    }
  }

  .bank-contacts {
    padding: 20px;

    .contact-item {
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .contact-info {
        margin-bottom: 8px;

        .contact-name {
          font-weight: bold;
          color: #333;
          margin-right: 8px;
        }

        .contact-position {
          color: #999;
          font-size: 13px;
        }
      }

      .contact-methods {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        a {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #1890ff;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;

          &:hover {
            color: #40a9ff;
          }
        }
      }
    }

    .no-contacts {
      padding: 20px 0;
      text-align: center;
      color: #999;
    }
  }
}
</style>
