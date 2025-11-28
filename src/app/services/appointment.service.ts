import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AppointmentOutput,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentStatus,
  AvailableTimeSlot,
} from '../models/appointment.types';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly apiUrl = `${environment.apiUrl}/appointments`;

  constructor(private readonly http: HttpClient) {}

  public getAll(): Observable<AppointmentOutput[]> {
    return this.http.get<AppointmentOutput[]>(this.apiUrl);
  }

  public getById(id: string): Observable<AppointmentOutput> {
    return this.http.get<AppointmentOutput>(`${this.apiUrl}/${id}`);
  }

  public getAvailableTimeSlots(
    storeId: string,
    serviceId: string,
    date: string,
  ): Observable<AvailableTimeSlot[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<AvailableTimeSlot[]>(
      `${this.apiUrl}/available-slots/${storeId}/${serviceId}`,
      { params },
    );
  }

  public create(createDto: CreateAppointmentDto): Observable<AppointmentOutput> {
    return this.http.post<AppointmentOutput>(this.apiUrl, createDto);
  }

  public update(id: string, updateDto: UpdateAppointmentDto): Observable<AppointmentOutput> {
    return this.http.put<AppointmentOutput>(`${this.apiUrl}/${id}`, updateDto);
  }

  public cancel(id: string): Observable<AppointmentOutput> {
    return this.http.post<AppointmentOutput>(`${this.apiUrl}/${id}/cancel`, {});
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public getMyStoreAppointments(options?: {
    date?: string;
    status?: AppointmentStatus;
    includeFuture?: boolean;
  }): Observable<AppointmentOutput[]> {
    let params = new HttpParams();
    if (options?.date) {
      params = params.set('date', options.date);
    }
    if (options?.status) {
      params = params.set('status', options.status);
    }
    if (options?.includeFuture) {
      params = params.set('includeFuture', 'true');
    }
    return this.http.get<AppointmentOutput[]>(`${this.apiUrl}/my-store`, { params });
  }

  public complete(id: string): Observable<AppointmentOutput> {
    return this.http.put<AppointmentOutput>(`${this.apiUrl}/${id}`, {
      status: AppointmentStatus.COMPLETED,
    });
  }

  public confirm(id: string): Observable<AppointmentOutput> {
    return this.http.put<AppointmentOutput>(`${this.apiUrl}/${id}`, {
      status: AppointmentStatus.CONFIRMED,
    });
  }
}

