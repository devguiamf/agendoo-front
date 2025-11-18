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
  IonList,
  IonSpinner,
  IonImg,
  ModalController,
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  createOutline,
  trashOutline,
  cashOutline,
  timeOutline,
  documentTextOutline,
  imageOutline,
} from 'ionicons/icons';
import { ServiceService } from '../../services/service.service';
import { ServiceOutput } from '../../models/service.types';
import { EditarServicoModalComponent } from './editar-servico-modal/editar-servico-modal.component';

@Component({
  selector: 'app-prestador-servicos',
  templateUrl: './servicos.page.html',
  styleUrls: ['./servicos.page.scss'],
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
    IonList,
    IonSpinner,
    IonImg,
  ],
})
export class PrestadorServicosPage implements OnInit {
  public services: ServiceOutput[] = [];
  public isLoading: boolean = false;

  constructor(
    private readonly serviceService: ServiceService,
    private readonly modalController: ModalController,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
    private readonly alertController: AlertController,
  ) {
    addIcons({
      addOutline,
      createOutline,
      trashOutline,
      cashOutline,
      timeOutline,
      documentTextOutline,
      imageOutline,
    });
  }

  public ngOnInit(): void {
    this.loadServices();
  }

  public async openCreateModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: EditarServicoModalComponent,
      componentProps: {
        service: null,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.updated) {
      await this.loadServices();
      await this.showToast('Serviço criado com sucesso!', 'success');
    }
  }

  public async openEditModal(service: ServiceOutput): Promise<void> {
    const modal = await this.modalController.create({
      component: EditarServicoModalComponent,
      componentProps: {
        service: { ...service },
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.updated) {
      await this.loadServices();
      await this.showToast('Serviço atualizado com sucesso!', 'success');
    }
  }

  public async handleDelete(service: ServiceOutput): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o serviço "${service.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            await this.deleteService(service.id);
          },
        },
      ],
    });
    await alert.present();
  }

  public formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }

  public formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
  }

  private async loadServices(): Promise<void> {
    this.isLoading = true;
    this.serviceService.getMyServices().subscribe({
      next: (services) => {
        this.services = services;
        this.isLoading = false;
      },
      error: async (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao carregar serviços';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  private async deleteService(id: string): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Excluindo...',
    });
    await loading.present();
    this.serviceService.delete(id).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.loadServices();
        await this.showToast('Serviço excluído com sucesso!', 'success');
      },
      error: async (error) => {
        await loading.dismiss();
        const errorMessage = error.error?.message || 'Erro ao excluir serviço';
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
