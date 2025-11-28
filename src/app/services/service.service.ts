import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServiceOutput, CreateServiceDto, UpdateServiceDto } from '../models/service.types';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private readonly apiUrl = `${environment.apiUrl}/services`;

  constructor(private readonly http: HttpClient) {}

  public getMyServices(): Observable<ServiceOutput[]> {
    return this.http.get<ServiceOutput[]>(`${this.apiUrl}/my-services`);
  }

  public getById(id: string): Observable<ServiceOutput> {
    return this.http.get<ServiceOutput>(`${this.apiUrl}/${id}`);
  }

  public getByStoreId(storeId: string): Observable<ServiceOutput[]> {
    return this.http.get<ServiceOutput[]>(`${this.apiUrl}/store/${storeId}`);
  }

  public create(createDto: CreateServiceDto, file?: File): Observable<ServiceOutput> {
    const formData = new FormData();
    formData.append('title', createDto.title);
    formData.append('description', createDto.description);
    formData.append('price', createDto.price.toString());
    formData.append('durationMinutes', createDto.durationMinutes.toString());
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<ServiceOutput>(this.apiUrl, formData);
  }

  public update(id: string, updateDto: UpdateServiceDto, file?: File): Observable<ServiceOutput> {
    const formData = new FormData();
    if (updateDto.title !== undefined) {
      formData.append('title', updateDto.title);
    }
    if (updateDto.description !== undefined) {
      formData.append('description', updateDto.description);
    }
    if (updateDto.price !== undefined) {
      formData.append('price', updateDto.price.toString());
    }
    if (updateDto.durationMinutes !== undefined) {
      formData.append('durationMinutes', updateDto.durationMinutes.toString());
    }
    if (file) {
      formData.append('file', file);
    }
    return this.http.put<ServiceOutput>(`${this.apiUrl}/${id}`, formData);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

