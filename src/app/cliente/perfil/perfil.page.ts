import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonAvatar,
  ModalController,
  ToastController,
  LoadingController,
  IonList,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  mailOutline,
  callOutline,
  documentTextOutline,
  createOutline,
  calendarOutline,
  timeOutline,
  logOutOutline,
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService, UpdateUserDto } from '../../services/user.service';
import { UserOutput } from '../../models/user.types';
import { EditarPerfilModalComponent } from './editar-perfil-modal/editar-perfil-modal.component';

@Component({
  selector: 'app-cliente-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonAvatar,
    IonList,
    IonSpinner,
  ],
})
export class ClientePerfilPage implements OnInit {
  public user: UserOutput | null = null;
  public isLoading: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly modalController: ModalController,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({
      personOutline,
      mailOutline,
      callOutline,
      documentTextOutline,
      createOutline,
      calendarOutline,
      timeOutline,
      logOutOutline,
    });
  }

  public ngOnInit(): void {
    this.loadUserData();
  }

  public async openEditModal(): Promise<void> {
    if (!this.user) {
      return;
    }
    const modal = await this.modalController.create({
      component: EditarPerfilModalComponent,
      componentProps: {
        user: { ...this.user },
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.updated) {
      await this.loadUserData();
      await this.showToast('Perfil atualizado com sucesso!', 'success');
    }
  }

  public formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  }

  public formatPhone(phone?: string): string {
    if (!phone) {
      return 'Não informado';
    }
    if (phone.length === 11) {
      return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
    }
    return phone;
  }

  public formatCpf(cpf?: string): string {
    if (!cpf) {
      return 'Não informado';
    }
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length === 11) {
      return `${cleanCpf.substring(0, 3)}.${cleanCpf.substring(3, 6)}.${cleanCpf.substring(6, 9)}-${cleanCpf.substring(9)}`;
    }
    return cpf;
  }

  public async handleLogout(): Promise<void> {
    const alert = await this.toastController.create({
      message: 'Saindo...',
      duration: 1000,
      position: 'top',
    });
    await alert.present();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private async loadUserData(): Promise<void> {
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      await this.showToast('Usuário não encontrado', 'danger');
      return;
    }
    this.isLoading = true;
    this.userService.getById(currentUser.id).subscribe({
      next: (user) => {
        this.user = user;
        this.isLoading = false;
      },
      error: async (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao carregar dados do perfil';
        await this.showToast(errorMessage, 'danger');
      },
    });
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

