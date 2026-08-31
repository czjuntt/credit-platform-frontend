import request from '../utils/request'

export const login = (data) => request.post('/auth/login', data)
export const logout = () => request.post('/auth/logout')

export const getUsers = (params) => request.get('/users', { params })
export const createUser = (data) => request.post('/users', data)
export const updateUser = (id, data) => request.put(`/users/${id}`, data)
export const resetUserPassword = (id, data) => request.put(`/users/${id}/reset-password`, data)
export const deleteUser = (id) => request.delete(`/users/${id}`)

export const getRoles = () => request.get('/roles')
export const createRole = (data) => request.post('/roles', data)
export const updateRole = (id, data) => request.put(`/roles/${id}`, data)
export const deleteRole = (id) => request.delete(`/roles/${id}`)

export const getBanks = (params) => request.get('/banks', { params })
export const createBank = (data) => request.post('/banks', data)
export const updateBank = (id, data) => request.put(`/banks/${id}`, data)
export const deleteBank = (id) => request.delete(`/banks/${id}`)

export const getBankContacts = (bankId) => request.get(`/banks/${bankId}/contacts`)
export const createBankContact = (bankId, data) => request.post(`/banks/${bankId}/contacts`, data)
export const updateBankContact = (id, data) => request.put(`/banks/contacts/${id}`, data)
export const deleteBankContact = (id) => request.delete(`/banks/contacts/${id}`)

export const getPolicies = (params) => request.get('/policies', { params })
export const createPolicy = (data) => request.post('/policies', data)
export const updatePolicy = (id, data) => request.put(`/policies/${id}`, data)
export const deletePolicy = (id) => request.delete(`/policies/${id}`)
export const auditPolicy = (id, data) => request.put(`/policies/${id}/audit`, data)

export const getProducts = (params) => request.get('/products', { params })
export const getProduct = (id) => request.get(`/products/${id}`)
export const createProduct = (data) => request.post('/products', data)
export const updateProduct = (id, data) => request.put(`/products/${id}`, data)
export const deleteProduct = (id) => request.delete(`/products/${id}`)
export const auditProduct = (id, data) => request.put(`/products/${id}/audit`, data)

export const getCases = (params) => request.get('/cases', { params })
export const createCase = (data) => request.post('/cases', data)
export const updateCase = (id, data) => request.put(`/cases/${id}`, data)
export const deleteCase = (id) => request.delete(`/cases/${id}`)
export const auditCase = (id, data) => request.put(`/cases/${id}/audit`, data)
