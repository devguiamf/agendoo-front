import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
  IonSpinner,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline, arrowBackOutline, checkmarkCircleOutline, alertCircleOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
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
    IonSpinner,
  ],
})
export class ResetPasswordPage implements OnInit {
  public token: string = '';
  public password: string = '';
  public confirmPassword: string = '';
  public isLoading: boolean = false;
  public isVerifying: boolean = true;
  public tokenValid: boolean = false;
  public resetSuccess: boolean = false;
  public email: string = '';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({ lockClosedOutline, arrowBackOutline, checkmarkCircleOutline, alertCircleOutline });
  }

  public ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (this.token) {
      this.verifyToken();
    } else {
      this.isVerifying = false;
      this.tokenValid = false;
    }
  }

  private verifyToken(): void {
    this.authService.verifyResetToken(this.token).subscribe({
      next: (response) => {
        this.isVerifying = false;
        this.tokenValid = response.valid;
        if (response.email) {
          this.email = response.email;
        }
      },
      error: () => {
        this.isVerifying = false;
        this.tokenValid = false;
      },
    });
  }

  public async handleSubmit(): Promise<void> {
    if (!this.password || !this.confirmPassword) {
      await this.showToast('Por favor, preencha todos os campos', 'warning');
      return;
    }
    if (this.password.length < 6) {
      await this.showToast('A senha deve ter no mínimo 6 caracteres', 'warning');
      return;
    }
    if (this.password !== this.confirmPassword) {
      await this.showToast('As senhas não coincidem', 'warning');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Redefinindo senha...',
    });
    await loading.present();
    this.isLoading = true;
    this.authService.confirmPasswordReset(this.token, this.password, this.confirmPassword).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isLoading = false;
        this.resetSuccess = true;
        await this.showToast('Senha redefinida com sucesso!', 'success');
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao redefinir senha. O link pode ter expirado.';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  public navigateToLogin(): void {
    this.router.navigate(['/login']);
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

