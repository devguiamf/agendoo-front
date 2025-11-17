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

  public create(createDto: CreateStoreDto): Observable<StoreOutput> {
    return this.http.post<StoreOutput>(this.apiUrl, createDto);
  }

  public update(id: string, updateDto: UpdateStoreDto): Observable<StoreOutput> {
    return this.http.put<StoreOutput>(`${this.apiUrl}/${id}`, updateDto);
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

