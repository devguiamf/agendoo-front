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

export type RegisterType = 'cliente' | 'parceiro';

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
  public selectedRegisterType: RegisterType = 'cliente';
  public fullName: string = '';
  public phone: string = '';
  public cpfCnpj: string = '';
  public email: string = '';
  public password: string = '';
  public confirmPassword: string = '';
  public passwordMismatch: boolean = false;

  constructor(private readonly router: Router) {
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
    this.selectedRegisterType = event.detail.value as RegisterType;
    this.resetForm();
  }

  public validatePasswords(): void {
    this.passwordMismatch = this.password !== this.confirmPassword && this.confirmPassword.length > 0;
  }

  public handleRegister(): void {
    if (!this.isFormValid()) {
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
    // TODO: Implementar lógica de cadastro
    console.log('Register:', {
      type: this.selectedRegisterType,
      fullName: this.fullName,
      phone: this.phone,
      cpfCnpj: this.selectedRegisterType === 'parceiro' ? this.cpfCnpj : undefined,
      email: this.email,
    });
  }

  public isFormValid(): boolean {
    if (this.selectedRegisterType === 'cliente') {
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
}

