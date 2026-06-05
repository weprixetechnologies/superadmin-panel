import api from '@/utils/axiosInstance';

export const consignmentApi = {
    getAll: (params?: any) => api.get('/consignments', { params }),
    getById: (id: string) => api.get(`/consignments/${id}`),
    create: (data: any) => api.post('/consignments', data),
    receiveItem: (id: string, data: any) => api.post(`/consignments/${id}/receive`, data),
    raiseDiscrepancy: (id: string, data: { description: string }) => api.post(`/consignments/${id}/discrepancy`, data),
    resolveDiscrepancy: (id: string, discrepancyId: string) => api.post(`/consignments/${id}/discrepancies/${discrepancyId}/resolve`),
    updateActualCount: (id: string, received_count: number) => api.put(`/consignments/${id}/actual-count`, { received_count }),
    markArrived: (id: string) => api.post(`/consignments/${id}/mark-arrived`),
};
