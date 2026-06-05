import api from '../utils/axiosInstance';

export const merchantApi = {
    getAll: (params: any) => api.get('/merchants', { params }),
    getById: (id: string) => api.get(`/merchants/${id}`),
    create: (data: any) => api.post('/merchants', data),
    update: (id: string, data: any) => api.put(`/merchants/${id}`, data),
    
    deactivate: (id: string, data: { reason: string }) => api.post(`/merchants/${id}/deactivate`, data),
    reactivate: (id: string) => api.post(`/merchants/${id}/reactivate`),
    
    assignMachine: (merchantId: string, data: any) => api.post(`/merchants/${merchantId}/machines`, data),
    unassignMachine: (merchantId: string, data: { machine_id: string, reason?: string }) => 
        api.delete(`/merchants/${merchantId}/machines`, { data }),
        
    getMerchantMachines: (merchantId: string) => api.get(`/merchants/${merchantId}/machines`),
    getMerchantMachineHistory: (merchantId: string) => api.get(`/merchants/${merchantId}/machines/history`),
    
    searchByMobile: (mobile: string) => api.get('/merchants/search', { params: { mobile } }),
    searchByPincode: (pincode: string) => api.get('/merchants/search-pincode', { params: { pincode } })
};
