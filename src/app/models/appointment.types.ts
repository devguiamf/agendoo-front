export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface AppointmentOutput {
  id: string;
  userId: string;
  storeId: string;
  serviceId: string;
  appointmentDate: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailableTimeSlot {
  startTime: string;
  endTime: string;
  date: string;
}

export interface CreateAppointmentDto {
  storeId: string;
  serviceId: string;
  appointmentDate: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  appointmentDate?: string;
  status?: AppointmentStatus;
  notes?: string;
}

