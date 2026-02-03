export type PatientStatus = 'confirmed' | 'priority' | 'completed' | 'canceled' | null;

export interface OperationType {
    id: number;
    name: string;
}

export interface Patient {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    embg: string;
    access_code: string;
    diagnosis: string;
    operation: number | null;
    operation_name?: string;
    status: PatientStatus;
    scheduled_data: string;
    created_at: string;
    position: number;
}

export interface DoctorProfile {
    id: number;
    user: number;
    phone: string | null;
    pin: string | null;
    is_active: boolean;
}

export interface PatientCounts {
    call: number;
    waiting: number;
    trash: number;
}