import { Injectable } from '@angular/core';
import { LoginOutput, UserOutput } from '../models/user.types';

const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public saveAuthData(loginOutput: LoginOutput): void {
    this.setAccessToken(loginOutput.accessToken);
    this.setUser(loginOutput.user);
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  public setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  public getUser(): UserOutput | null {
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) {
      return null;
    }
    try {
      const user = JSON.parse(userJson);
      return {
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  public setUser(user: UserOutput): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  public clearAuthData(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

