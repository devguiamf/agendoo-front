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
  IonSegment,
  IonSegmentButton,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  businessOutline,
  lockClosedOutline,
  mailOutline,
  callOutline,
  documentTextOutline,
  alertCircle,
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { StoreService } from '../services/store.service';
import { UserType } from '../models/user.types';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
    IonSegment,
    IonSegmentButton,
  ],
})
export class RegisterPage {
  public selectedRegisterType: UserType = UserType.CLIENTE;
  public fullName: string = '';
  public phone: string = '';
  public cpfCnpj: string = '';
  public email: string = '';
  public password: string = '';
  public confirmPassword: string = '';
  public passwordMismatch: boolean = false;
  public isLoading: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly storeService: StoreService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({
      personOutline,
      businessOutline,
      lockClosedOutline,
      mailOutline,
      callOutline,
      documentTextOutline,
      alertCircle,
    });
  }

  public handleRegisterTypeChange(event: CustomEvent): void {
    this.selectedRegisterType = event.detail.value as UserType;
    this.resetForm();
  }

  public onCpfInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    let formattedValue = value;
    if (value.length <= 11) {
      if (value.length > 9) {
        formattedValue = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
      } else if (value.length > 6) {
        formattedValue = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
      } else if (value.length > 3) {
        formattedValue = `${value.substring(0, 3)}.${value.substring(3)}`;
      }
    }
    this.cpfCnpj = formattedValue;
    input.value = formattedValue;
  }

  public validatePasswords(): void {
    this.passwordMismatch = this.password !== this.confirmPassword && this.confirmPassword.length > 0;
  }

  public async handleRegister(): Promise<void> {
    if (!this.isFormValid()) {
      await this.showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      await this.showToast('As senhas não coincidem', 'warning');
      return;
    }
    if (this.password.length < 6) {
      await this.showToast('A senha deve ter no mínimo 6 caracteres', 'warning');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Cadastrando...',
    });
    await loading.present();
    this.isLoading = true;
    const signupDto = {
      name: this.fullName,
      email: this.email,
      password: this.password,
      type: this.selectedRegisterType,
      phone: this.phone,
      cpf: this.selectedRegisterType === UserType.PRESTADOR ? this.cpfCnpj : undefined,
    };
    this.authService.signup(signupDto).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isLoading = false;
        await this.showToast('Cadastro realizado com sucesso!', 'success');
        const user = this.authService.getUser();
        if (user?.type === UserType.PRESTADOR) {
          this.router.navigate(['/prestador/loja']);
        } else if (user?.type === UserType.CLIENTE) {
          this.router.navigate(['/cliente/busca']);
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao realizar cadastro. Tente novamente.';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  public isFormValid(): boolean {
    if (this.selectedRegisterType === UserType.CLIENTE) {
      return !!(
        this.fullName &&
        this.phone &&
        this.email &&
        this.password &&
        this.confirmPassword
      );
    } else {
      return !!(
        this.fullName &&
        this.phone &&
        this.cpfCnpj &&
        this.email &&
        this.password &&
        this.confirmPassword
      );
    }
  }

  public navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  private resetForm(): void {
    this.fullName = '';
    this.phone = '';
    this.cpfCnpj = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.passwordMismatch = false;
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

