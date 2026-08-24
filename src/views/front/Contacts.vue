<template>
  <div class="front-page">
    <Header />
    <main class="main-content">
      <div class="page-container">
        <div class="page-header">
          <h1>咨询电话</h1>
          <p>各银行联系电话，欢迎咨询</p>
        </div>

        <div class="group-list" v-loading="loading">
          <div
            v-for="bank in banks"
            :key="bank.id"
            class="bank-group"
            :class="{ expanded: expandedBank === bank.id }"
          >
            <div class="group-header" @click="toggleBank(bank.id)">
              <span class="bank-name">{{ bank.bank_name }}</span>
              <span class="bank-count" v-if="getContacts(bank.id).length">{{ getContacts(bank.id).length }} 位联系人</span>
              <el-icon class="arrow" :class="{ rotated: expandedBank === bank.id }"><ArrowDown /></el-icon>
            </div>
            <transition name="expand">
              <div v-show="expandedBank === bank.id" class="group-body">
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
            </transition>
          </div>
          <el-empty v-if="banks.length === 0 && !loading" description="暂无银行信息" />
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowDown, Phone, Iphone, Message } from '@element-plus/icons-vue'
import Header from '../../components/Header.vue'
import Footer from '../../components/Footer.vue'
import { getBanks, getBankContacts } from '../../api'

const banks = ref([])
const contactsMap = ref({})
const loading = ref(false)
const expandedBank = ref(null)

function getContacts(bankId) {
  return contactsMap.value[bankId] || []
}

function toggleBank(bankId) {
  expandedBank.value = expandedBank.value === bankId ? null : bankId
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

.bank-group {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: box-shadow 0.3s;

  &.expanded {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
}

.group-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  gap: 12px;

  .bank-name {
    font-size: 16px;
    font-weight: 600;
    color: #1a365d;
    flex: 1;
  }

  .bank-count {
    font-size: 12px;
    color: #999;
    background: #f0f2f5;
    padding: 3px 10px;
    border-radius: 12px;
  }

  .arrow {
    transition: transform 0.3s;
    color: #ccc;

    &.rotated {
      transform: rotate(180deg);
    }
  }
}

.group-body {
  padding: 0 20px 12px;

  .contact-item {
    padding: 12px 0;
    border-top: 1px solid #f5f5f5;

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

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 600px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
