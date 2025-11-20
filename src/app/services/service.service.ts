import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServiceOutput, CreateServiceDto, UpdateServiceDto } from '../models/service.types';

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private readonly apiUrl = `${environment.apiUrl}/services`;
  private useMockData = true;
  private mockServices: ServiceOutput[] = [
    {
      id: 'service-1',
      title: 'Corte de Cabelo Masculino',
      description: 'Corte de cabelo moderno com técnicas profissionais',
      price: 50.0,
      durationMinutes: 30,
      storeId: 'store-1',
      imageUrl: 'https://via.placeholder.com/400x300?text=Corte+Cabelo',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01'),
    },
    {
      id: 'service-2',
      title: 'Barba Completa',
      description: 'Aparar e modelar barba com toalha quente e finalização',
      price: 35.0,
      durationMinutes: 25,
      storeId: 'store-2',
      imageUrl: 'https://via.placeholder.com/400x300?text=Barba',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-11-15'),
    },
    {
      id: 'service-3',
      title: 'Tatuagem Pequena',
      description: 'Tatuagem de até 10cm com design personalizado',
      price: 200.0,
      durationMinutes: 60,
      storeId: 'store-3',
      imageUrl: 'https://via.placeholder.com/400x300?text=Tatuagem',
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-12-05'),
    },
  ];

  constructor(private readonly http: HttpClient) {}

  public getMyServices(): Observable<ServiceOutput[]> {
    return this.http.get<ServiceOutput[]>(`${this.apiUrl}/my-services`);
  }

  public getById(id: string): Observable<ServiceOutput> {
    if (this.useMockData) {
      const service = this.mockServices.find((s) => s.id === id);
      if (!service) {
        throw new Error('Service not found');
      }
      return of(service).pipe(delay(300));
    }
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
    if (createDto.imageUrl && !file) {
      formData.append('imageUrl', createDto.imageUrl);
    }
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
    if (updateDto.imageUrl && !file) {
      formData.append('imageUrl', updateDto.imageUrl);
    }
    if (file) {
      formData.append('file', file);
    }
    return this.http.put<ServiceOutput>(`${this.apiUrl}/${id}`, formData);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  public uploadImage(id: string, file: File): Observable<ServiceOutput> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ServiceOutput>(`${this.apiUrl}/${id}/upload-image`, formData);
  }
}

