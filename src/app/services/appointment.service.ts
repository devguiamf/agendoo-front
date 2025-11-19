import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { AppointmentOutput, CreateAppointmentDto, UpdateAppointmentDto, AppointmentStatus } from '../models/appointment.types';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly apiUrl = '/appointments';
  private mockAppointments: AppointmentOutput[] = [
    {
      id: '1',
      userId: 'user-1',
      storeId: 'store-1',
      serviceId: 'service-1',
      appointmentDate: new Date('2024-12-20T10:00:00'),
      status: AppointmentStatus.PENDING,
      notes: 'Primeira consulta',
      createdAt: new Date('2024-12-15T10:00:00'),
      updatedAt: new Date('2024-12-15T10:00:00'),
    },
    {
      id: '2',
      userId: 'user-1',
      storeId: 'store-2',
      serviceId: 'service-2',
      appointmentDate: new Date('2024-12-22T14:30:00'),
      status: AppointmentStatus.CONFIRMED,
      notes: 'Retorno',
      createdAt: new Date('2024-12-16T10:00:00'),
      updatedAt: new Date('2024-12-17T10:00:00'),
    },
    {
      id: '3',
      userId: 'user-1',
      storeId: 'store-1',
      serviceId: 'service-3',
      appointmentDate: new Date('2024-12-25T09:00:00'),
      status: AppointmentStatus.PENDING,
      createdAt: new Date('2024-12-18T10:00:00'),
      updatedAt: new Date('2024-12-18T10:00:00'),
    },
  ];

  public getAll(): Observable<AppointmentOutput[]> {
    return of(this.mockAppointments).pipe(delay(500));
  }

  public getById(id: string): Observable<AppointmentOutput> {
    const appointment = this.mockAppointments.find((a) => a.id === id);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    return of(appointment).pipe(delay(300));
  }

  public create(createDto: CreateAppointmentDto): Observable<AppointmentOutput> {
    const newAppointment: AppointmentOutput = {
      id: Date.now().toString(),
      userId: 'user-1',
      storeId: createDto.storeId,
      serviceId: createDto.serviceId,
      appointmentDate: new Date(createDto.appointmentDate),
      status: AppointmentStatus.PENDING,
      notes: createDto.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockAppointments.push(newAppointment);
    return of(newAppointment).pipe(delay(500));
  }

  public update(id: string, updateDto: UpdateAppointmentDto): Observable<AppointmentOutput> {
    const index = this.mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    const updatedAppointment: AppointmentOutput = {
      ...this.mockAppointments[index],
      ...updateDto,
      appointmentDate: updateDto.appointmentDate ? new Date(updateDto.appointmentDate) : this.mockAppointments[index].appointmentDate,
      updatedAt: new Date(),
    };
    this.mockAppointments[index] = updatedAppointment;
    return of(updatedAppointment).pipe(delay(500));
  }

  public cancel(id: string): Observable<AppointmentOutput> {
    return this.update(id, { status: AppointmentStatus.CANCELLED });
  }

  public delete(id: string): Observable<void> {
    const index = this.mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error('Appointment not found');
    }
    this.mockAppointments.splice(index, 1);
    return of(undefined).pipe(delay(300));
  }
}

