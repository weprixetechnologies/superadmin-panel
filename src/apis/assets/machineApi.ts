import api from '@/utils/axiosInstance';

export const machineApi = {
    getAll: (params: any) => api.get('/machines', { params }),
    getStats: () => api.get('/machines/stats'),
    getById: (id: string) => api.get(`/machines/${id}`),
    create: (data: any) => api.post('/machines', data),
    update: (id: string, data: any) => api.put(`/machines/${id}`, data),
    decommission: (id: string, data: { reason: string }) => api.post(`/machines/${id}/decommission`, data),
    mapTid: (id: string, data: any) => api.post(`/machines/${id}/map-tid`, data),
    unmapTid: (id: string) => api.post(`/machines/${id}/unmap-tid`),
    dispatch: (id: string, data: any) => api.post(`/machines/${id}/dispatch`, data),
    transfer: (id: string, data: any) => api.post(`/machines/${id}/transfer`, data),
    getCustody: (id: string) => api.get(`/machines/${id}/custody`),
    getTidHistory: (id: string) => api.get(`/machines/${id}/tid-history`),
    confirmReceipt: (id: string, data: any) => api.post(`/machines/${id}/confirm-receipt`, data),
};
