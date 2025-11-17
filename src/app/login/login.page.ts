import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logInOutline, lockClosedOutline, mailOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { UserType } from '../models/user.types';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    FormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
  ],
})
export class LoginPage {
  public email: string = '';
  public password: string = '';
  public isLoading: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({ logInOutline, lockClosedOutline, mailOutline });
  }

  public async handleLogin(): Promise<void> {
    if (!this.email || !this.password) {
      await this.showToast('Por favor, preencha todos os campos', 'warning');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Entrando...',
    });
    await loading.present();
    this.isLoading = true;
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading = false;
        await this.showToast('Login realizado com sucesso!', 'success');
        if (response.user.type === UserType.PRESTADOR) {
          this.router.navigate(['/prestador/home']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao fazer login. Verifique suas credenciais.';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  public navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    await toast.present();
  }
}

