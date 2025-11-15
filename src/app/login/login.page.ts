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
import { personOutline, businessOutline, lockClosedOutline, mailOutline } from 'ionicons/icons';

export type LoginType = 'cliente' | 'parceiro';

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
    IonSegment,
    IonSegmentButton,
  ],
})
export class LoginPage {
  public selectedLoginType: LoginType = 'cliente';
  public email: string = '';
  public password: string = '';

  constructor(private readonly router: Router) {
    addIcons({ personOutline, businessOutline, lockClosedOutline, mailOutline });
  }

  public handleLoginTypeChange(event: CustomEvent): void {
    this.selectedLoginType = event.detail.value as LoginType;
  }

  public handleLogin(): void {
    if (!this.email || !this.password) {
      return;
    }
    // TODO: Implementar lógica de autenticação
    console.log('Login:', { type: this.selectedLoginType, email: this.email });
  }
}

