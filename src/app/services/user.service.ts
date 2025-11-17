import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserOutput } from '../models/user.types';
import { StorageService } from './storage.service';

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private readonly http: HttpClient,
    private readonly storageService: StorageService,
  ) {}

  public getById(id: string): Observable<UserOutput> {
    return this.http.get<UserOutput>(`${this.apiUrl}/${id}`);
  }

  public update(id: string, updateDto: UpdateUserDto): Observable<UserOutput> {
    return this.http.put<UserOutput>(`${this.apiUrl}/${id}`, updateDto).pipe(
      tap((updatedUser) => {
        const currentUser = this.storageService.getUser();
        if (currentUser && currentUser.id === id) {
          this.storageService.setUser(updatedUser);
        }
      }),
    );
  }

  public delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

