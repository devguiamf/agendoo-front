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

  public create(createDto: CreateServiceDto): Observable<ServiceOutput> {
    return this.http.post<ServiceOutput>(this.apiUrl, createDto);
  }

  public update(id: string, updateDto: UpdateServiceDto): Observable<ServiceOutput> {
    return this.http.put<ServiceOutput>(`${this.apiUrl}/${id}`, updateDto);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

