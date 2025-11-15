import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginDto, SignupDto, LoginOutput, SignupOutput, UserOutput } from '../models/user.types';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(
    private readonly http: HttpClient,
    private readonly storageService: StorageService,
  ) {}

  public login(loginDto: LoginDto): Observable<LoginOutput> {
    return this.http.post<LoginOutput>(`${this.apiUrl}/login`, loginDto).pipe(
      tap((response) => {
        this.storageService.saveAuthData(response);
      }),
    );
  }

  public signup(signupDto: SignupDto): Observable<SignupOutput> {
    return this.http.post<SignupOutput>(`${this.apiUrl}/signup`, signupDto).pipe(
      tap((response) => {
        this.storageService.saveAuthData(response);
      }),
    );
  }

  public logout(): void {
    this.storageService.clearAuthData();
  }

  public getAccessToken(): string | null {
    return this.storageService.getAccessToken();
  }

  public getUser(): UserOutput | null {
    return this.storageService.getUser();
  }

  public isAuthenticated(): boolean {
    return this.storageService.isAuthenticated();
  }
}


