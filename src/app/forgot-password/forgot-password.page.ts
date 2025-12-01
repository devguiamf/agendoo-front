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
import { mailOutline, arrowBackOutline, sendOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
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
export class ForgotPasswordPage {
  public email: string = '';
  public isLoading: boolean = false;
  public emailSent: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({ mailOutline, arrowBackOutline, sendOutline });
  }

  public async handleSubmit(): Promise<void> {
    if (!this.email) {
      await this.showToast('Por favor, informe seu e-mail', 'warning');
      return;
    }
    if (!this.isValidEmail(this.email)) {
      await this.showToast('Por favor, informe um e-mail válido', 'warning');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Enviando...',
    });
    await loading.present();
    this.isLoading = true;
    this.authService.requestPasswordReset(this.email).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isLoading = false;
        this.emailSent = true;
        await this.showToast('Se o e-mail existir, você receberá um link para redefinir sua senha', 'success');
      },
      error: async () => {
        await loading.dismiss();
        this.isLoading = false;
        this.emailSent = true;
        await this.showToast('Se o e-mail existir, você receberá um link para redefinir sua senha', 'success');
      },
    });
  }

  public navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 4000,
      color,
      position: 'top',
    });
    await toast.present();
  }
}

