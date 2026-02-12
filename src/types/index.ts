export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'manager' | 'employee';
    organization_id: string;
    status: 'active' | 'inactive' | 'suspended';
    last_seen?: string;
    created_at: string;
}

export interface Organization {
    id: string;
    name: string;
    plan_type?: string;
    created_at: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    organization_id: string;
    created_by: string;
    created_at: string;
}

export interface WorkSession {
    id: string;
    user_id: string;
    organization_id: string;
    project_id?: string;
    start_time: string;
    end_time?: string;
    total_active_seconds: number;
    total_idle_seconds: number;
    status: 'active' | 'stopped';
    last_activity_at?: string;
    created_at: string;
}

export interface DailySummary {
    id?: string;
    user_id: string;
    date: string;
    total_work_seconds: number;
    active_seconds: number;
    idle_seconds: number;
    productivity_score: number;
    sessions_count?: number;
}

export interface AuthResponse {
    user: User;
    access_token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
    organization_id: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    organization_id: string;
    role?: 'admin' | 'manager' | 'employee';
}
