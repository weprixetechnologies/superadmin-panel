import api from '@/utils/axiosInstance';

export const stockItemApi = {
    getAll: (params?: any) => api.get('/stock-items', { params }),
    getById: (id: string) => api.get(`/stock-items/${id}`),
    update: (id: string, data: any) => api.put(`/stock-items/${id}`, data),
    decommission: (id: string, data: { reason: string }) => api.post(`/stock-items/${id}/decommission`, data),
};
