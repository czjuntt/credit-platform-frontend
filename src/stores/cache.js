import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCacheStore = defineStore('cache', () => {
  const banks = ref([])
  const policies = ref([])
  const products = ref([])
  const cases = ref([])
  const roles = ref([])
  const users = ref([])
  const bankContacts = ref({})
  const updatedAt = ref(null)

  const isCacheReady = computed(() => {
    return banks.value.length > 0 || policies.value.length > 0
  })

  function setBanks(data) {
    banks.value = data
  }

  function setPolicies(data) {
    policies.value = data
  }

  function setProducts(data) {
    products.value = data
  }

  function setCases(data) {
    cases.value = data
  }

  function setRoles(data) {
    roles.value = data
  }

  function setUsers(data) {
    users.value = data
  }

  function setBankContacts(bankId, data) {
    bankContacts.value[bankId] = data
  }

  function updateData(table, data) {
    const key = `${table}s`
    if (key === 'banks' && Array.isArray(data)) setBanks(data)
    if (key === 'policies' && Array.isArray(data)) setPolicies(data)
    if (key === 'products' && Array.isArray(data)) setProducts(data)
    if (key === 'cases' && Array.isArray(data)) setCases(data)
  }

  function handleSSEUpdate(event) {
    const { table, action, record } = event
    
    if (action === 'full_update') {
      updatedAt.value = Date.now()
      return
    }
    
    if (!table || !action) return
    
    const map = {
      'banks': 'banks',
      'policies': 'policies',
      'products': 'products',
      'cases': 'cases',
      'roles': 'roles',
      'users': 'users',
      'bank_contacts': 'bankContacts'
    }
    
    const target = map[table]
    if (!target) return
    
    if (target === 'bankContacts' && record?.bank_id) {
      const current = bankContacts.value[record.bank_id] || []
      if (action === 'create') {
        bankContacts.value[record.bank_id] = [...current, record]
      } else if (action === 'update') {
        bankContacts.value[record.bank_id] = current.map(item => 
          item.id === record.id ? record : item
        )
      } else if (action === 'delete') {
        bankContacts.value[record.bank_id] = current.filter(item => item.id !== record.id)
      }
      return
    }
    
    const current = this[target] ? this[target].value : []
    
    if (action === 'create') {
      this[target].value = [record, ...current]
    } else if (action === 'update') {
      this[target].value = current.map(item => 
        item.id === record.id ? record : item
      )
    } else if (action === 'delete') {
      this[target].value = current.filter(item => item.id !== record.id)
    } else if (action === 'audit') {
      this[target].value = current.map(item => 
        item.id === record.id ? record : item
      )
    }
    
    updatedAt.value = Date.now()
  }

  function clearAll() {
    banks.value = []
    policies.value = []
    products.value = []
    cases.value = []
    roles.value = []
    users.value = []
    bankContacts.value = {}
    updatedAt.value = null
  }

  return {
    banks,
    policies,
    products,
    cases,
    roles,
    users,
    bankContacts,
    isCacheReady,
    updatedAt,
    setBanks,
    setPolicies,
    setProducts,
    setCases,
    setRoles,
    setUsers,
    setBankContacts,
    updateData,
    handleSSEUpdate,
    clearAll
  }
})
