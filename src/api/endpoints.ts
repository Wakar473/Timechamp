import apiClient from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', data);
        return response.data;
    },
};

export const sessionsApi = {
    start: async (project_id?: string) => {
        const response = await apiClient.post('/sessions/start', { project_id });
        return response.data;
    },

    stop: async (sessionId: string) => {
        const response = await apiClient.post(`/sessions/${sessionId}/stop`);
        return response.data;
    },

    getActive: async () => {
        const response = await apiClient.get('/sessions/active');
        return response.data;
    },
};

export const projectsApi = {
    getAll: async () => {
        const response = await apiClient.get('/projects');
        return response.data;
    },

    create: async (data: { name: string; description?: string }) => {
        const response = await apiClient.post('/projects', data);
        return response.data;
    },

    update: async (id: string, data: { name?: string; description?: string }) => {
        const response = await apiClient.put(`/projects/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await apiClient.delete(`/projects/${id}`);
        return response.data;
    },
};

export const reportsApi = {
    getDaily: async (date: string, userId?: string) => {
        const response = await apiClient.get('/reports/daily', {
            params: { date, userId },
        });
        return response.data;
    },

    getUserReport: async (userId: string, startDate: string, endDate: string) => {
        const response = await apiClient.get(`/reports/user/${userId}`, {
            params: { startDate, endDate },
        });
        return response.data;
    },
};

export const healthApi = {
    check: async () => {
        const response = await apiClient.get('/health');
        return response.data;
    },
};
