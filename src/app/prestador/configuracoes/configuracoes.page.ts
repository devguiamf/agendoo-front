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
  IonList,
  IonSpinner,
  ModalController,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  storefrontOutline,
  locationOutline,
  timeOutline,
  calendarOutline,
  createOutline,
  addOutline,
  imageOutline,
} from 'ionicons/icons';
import { AuthService } from '../../services/auth.service';
import { StoreService } from '../../services/store.service';
import { StoreOutput } from '../../models/store.types';
import { EditarLojaModalComponent } from './editar-loja-modal/editar-loja-modal.component';

@Component({
  selector: 'app-prestador-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
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
export class PrestadorConfiguracoesPage implements OnInit {
  public store: StoreOutput | null = null;
  public isLoading: boolean = false;
  public hasStore: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly storeService: StoreService,
    private readonly modalController: ModalController,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({
      storefrontOutline,
      locationOutline,
      timeOutline,
      calendarOutline,
      createOutline,
      addOutline,
      imageOutline,
    });
  }

  public ngOnInit(): void {
    this.loadStoreData();
  }

  public async openEditModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: EditarLojaModalComponent,
      componentProps: {
        store: this.store,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.updated) {
      await this.loadStoreData();
      await this.showToast('Loja atualizada com sucesso!', 'success');
    }
  }

  public async openCreateModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: EditarLojaModalComponent,
      componentProps: {
        store: null,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.updated) {
      await this.loadStoreData();
      await this.showToast('Loja criada com sucesso!', 'success');
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

  public formatTime(time?: string): string {
    if (!time) {
      return 'Não informado';
    }
    return time;
  }

  public getDayName(dayOfWeek: number): string {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[dayOfWeek] || 'Desconhecido';
  }

  public formatAddress(location: StoreOutput['location']): string {
    const parts = [
      `${location.street}, ${location.number}`,
      location.complement,
      location.neighborhood,
      `${location.city} - ${location.state}`,
      location.zipCode,
    ].filter(Boolean);
    return parts.join(', ');
  }

  public getAppointmentIntervalLabel(interval: number): string {
    const labels: Record<number, string> = {
      5: '5 minutos',
      10: '10 minutos',
      15: '15 minutos',
      30: '30 minutos',
    };
    return labels[interval] || `${interval} minutos`;
  }

  private async loadStoreData(): Promise<void> {
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      await this.showToast('Usuário não encontrado', 'danger');
      return;
    }
    this.isLoading = true;
    this.storeService.getByUserId(currentUser.id).subscribe({
      next: (store) => {
        this.store = store;
        this.hasStore = true;
        this.isLoading = false;
      },
      error: async (error) => {
        if (error.status === 404) {
          this.hasStore = false;
          this.store = null;
        } else {
          const errorMessage = error.error?.message || 'Erro ao carregar dados da loja';
          await this.showToast(errorMessage, 'danger');
        }
        this.isLoading = false;
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
