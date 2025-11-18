import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StoreOutput, CreateStoreDto, UpdateStoreDto } from '../models/store.types';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly apiUrl = `${environment.apiUrl}/stores`;

  constructor(private readonly http: HttpClient) {}

  public getByUserId(userId: string): Observable<StoreOutput> {
    return this.http.get<StoreOutput>(`${this.apiUrl}/user/${userId}`);
  }

  public getById(id: string): Observable<StoreOutput> {
    return this.http.get<StoreOutput>(`${this.apiUrl}/${id}`);
  }

  public create(createDto: CreateStoreDto, file?: File): Observable<StoreOutput> {
    const formData = new FormData();
    formData.append('name', createDto.name);
    formData.append('userId', createDto.userId);
    formData.append('workingHours', JSON.stringify(createDto.workingHours));
    formData.append('location', JSON.stringify(createDto.location));
    formData.append('appointmentInterval', createDto.appointmentInterval.toString());
    if (createDto.imageUrl && !file) {
      formData.append('imageUrl', createDto.imageUrl);
    }
    if (file) {
      formData.append('file', file);
    }
    return this.http.post<StoreOutput>(this.apiUrl, formData);
  }

  public update(id: string, updateDto: UpdateStoreDto, file?: File): Observable<StoreOutput> {
    const formData = new FormData();
    if (updateDto.name !== undefined) {
      formData.append('name', updateDto.name);
    }
    if (updateDto.workingHours !== undefined) {
      formData.append('workingHours', JSON.stringify(updateDto.workingHours));
    }
    if (updateDto.location !== undefined) {
      formData.append('location', JSON.stringify(updateDto.location));
    }
    if (updateDto.appointmentInterval !== undefined) {
      formData.append('appointmentInterval', updateDto.appointmentInterval.toString());
    }
    if (updateDto.imageUrl && !file) {
      formData.append('imageUrl', updateDto.imageUrl);
    }
    if (file) {
      formData.append('file', file);
    }
    return this.http.put<StoreOutput>(`${this.apiUrl}/${id}`, formData);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public uploadImage(id: string, file: File): Observable<StoreOutput> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<StoreOutput>(`${this.apiUrl}/${id}/upload-image`, formData);
  }
}

