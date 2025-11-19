import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../environments/environment';
import { StoreOutput, CreateStoreDto, UpdateStoreDto, AppointmentInterval } from '../models/store.types';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private readonly apiUrl = `${environment.apiUrl}/stores`;
  private useMockData = true;
  private mockStores: StoreOutput[] = [
    {
      id: 'store-1',
      name: 'Salão Beleza & Estilo',
      userId: 'prestador-1',
      workingHours: [
        { dayOfWeek: 0, isOpen: false },
        { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' },
      ],
      location: {
        street: 'Rua das Flores',
        number: '123',
        complement: 'Sala 2',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        latitude: -23.5505,
        longitude: -46.6333,
      },
      appointmentInterval: AppointmentInterval.THIRTY_MINUTES,
      imageUrl: 'https://via.placeholder.com/400x300?text=Salão+Beleza',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01'),
    },
    {
      id: 'store-2',
      name: 'Barbearia Moderna',
      userId: 'prestador-2',
      workingHours: [
        { dayOfWeek: 0, isOpen: false },
        { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '19:00' },
        { dayOfWeek: 6, isOpen: true, openTime: '08:00', closeTime: '16:00' },
      ],
      location: {
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-200',
        latitude: -23.5614,
        longitude: -46.6558,
      },
      appointmentInterval: AppointmentInterval.FIFTEEN_MINUTES,
      imageUrl: 'https://via.placeholder.com/400x300?text=Barbearia+Moderna',
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-11-15'),
    },
    {
      id: 'store-3',
      name: 'Estúdio de Tatuagem Art',
      userId: 'prestador-3',
      workingHours: [
        { dayOfWeek: 0, isOpen: true, openTime: '12:00', closeTime: '18:00' },
        { dayOfWeek: 1, isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '18:00' },
      ],
      location: {
        street: 'Rua Augusta',
        number: '500',
        complement: 'Loja 3',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-000',
        latitude: -23.5503,
        longitude: -46.6653,
      },
      appointmentInterval: AppointmentInterval.THIRTY_MINUTES,
      imageUrl: 'https://via.placeholder.com/400x300?text=Estúdio+Tatuagem',
      createdAt: new Date('2024-03-20'),
      updatedAt: new Date('2024-12-05'),
    },
  ];

  constructor(private readonly http: HttpClient) {}

  public getAll(): Observable<StoreOutput[]> {
    if (this.useMockData) {
      return of(this.mockStores).pipe(delay(500));
    }
    return this.http.get<StoreOutput[]>(this.apiUrl);
  }

  public getByUserId(userId: string): Observable<StoreOutput> {
    return this.http.get<StoreOutput>(`${this.apiUrl}/user/${userId}`);
  }

  public getById(id: string): Observable<StoreOutput> {
    if (this.useMockData) {
      const store = this.mockStores.find((s) => s.id === id);
      if (!store) {
        throw new Error('Store not found');
      }
      return of(store).pipe(delay(300));
    }
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

