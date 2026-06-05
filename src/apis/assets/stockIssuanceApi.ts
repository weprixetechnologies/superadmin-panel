import api from '@/utils/axiosInstance';

export const stockIssuanceApi = {
    getAll: (params?: any) => api.get('/stock-issuances', { params }),
    getById: (id: string) => api.get(`/stock-issuances/${id}`),
    issue: (data: any) => api.post('/stock-issuances', data),
    acknowledge: (id: string, data: { receipt_photo?: string }) => api.post(`/stock-issuances/${id}/acknowledge`, data),
    returnItem: (id: string, data: any) => api.post(`/stock-issuances/${id}/return`, data),
};
