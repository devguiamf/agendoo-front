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
  IonBadge,
  ToastController,
  AlertController,
  LoadingController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  timeOutline,
  locationOutline,
  documentTextOutline,
  closeCircleOutline,
  trashOutline,
  checkmarkCircleOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentOutput, AppointmentStatus } from '../../models/appointment.types';
import { StoreService } from '../../services/store.service';
import { ServiceService } from '../../services/service.service';
import { StoreOutput } from '../../models/store.types';
import { ServiceOutput } from '../../models/service.types';

@Component({
  selector: 'app-cliente-agendamentos',
  templateUrl: './agendamentos.page.html',
  styleUrls: ['./agendamentos.page.scss'],
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
    IonBadge,
  ],
})
export class ClienteAgendamentosPage implements OnInit {
  public appointments: AppointmentOutput[] = [];
  public activeAppointments: AppointmentOutput[] = [];
  public stores: Map<string, StoreOutput> = new Map();
  public services: Map<string, ServiceOutput> = new Map();
  public isLoading: boolean = false;

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly storeService: StoreService,
    private readonly serviceService: ServiceService,
    private readonly toastController: ToastController,
    private readonly alertController: AlertController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({
      calendarOutline,
      timeOutline,
      locationOutline,
      documentTextOutline,
      closeCircleOutline,
      trashOutline,
      checkmarkCircleOutline,
      storefrontOutline,
    });
  }

  public ngOnInit(): void {
    this.loadAppointments();
  }

  public getStatusColor(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'warning';
      case AppointmentStatus.CONFIRMED:
        return 'primary';
      case AppointmentStatus.COMPLETED:
        return 'success';
      case AppointmentStatus.CANCELLED:
        return 'danger';
      default:
        return 'medium';
    }
  }

  public getStatusLabel(status: AppointmentStatus): string {
    switch (status) {
      case AppointmentStatus.PENDING:
        return 'Pendente';
      case AppointmentStatus.CONFIRMED:
        return 'Confirmado';
      case AppointmentStatus.COMPLETED:
        return 'Concluído';
      case AppointmentStatus.CANCELLED:
        return 'Cancelado';
      default:
        return status;
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

  public formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  public formatDateTime(date: Date | string): string {
    return `${this.formatDate(date)} às ${this.formatTime(date)}`;
  }

  public getStoreName(storeId: string): string {
    return this.stores.get(storeId)?.name || 'Estabelecimento não encontrado';
  }

  public getServiceName(serviceId: string): string {
    return this.services.get(serviceId)?.title || 'Serviço não encontrado';
  }

  public getStoreAddress(storeId: string): string {
    const store = this.stores.get(storeId);
    if (!store) {
      return '';
    }
    return `${store.location.street}, ${store.location.number} - ${store.location.neighborhood}`;
  }

  public canCancel(appointment: AppointmentOutput): boolean {
    return (
      appointment.status === AppointmentStatus.PENDING ||
      appointment.status === AppointmentStatus.CONFIRMED
    );
  }

  public async handleCancel(appointment: AppointmentOutput): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar Cancelamento',
      message: `Tem certeza que deseja cancelar o agendamento de ${this.formatDateTime(appointment.appointmentDate)}?`,
      buttons: [
        {
          text: 'Não',
          role: 'cancel',
        },
        {
          text: 'Sim, Cancelar',
          role: 'destructive',
          handler: async () => {
            await this.cancelAppointment(appointment.id);
          },
        },
      ],
    });
    await alert.present();
  }

  public async handleDelete(appointment: AppointmentOutput): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir permanentemente este agendamento?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: async () => {
            await this.deleteAppointment(appointment.id);
          },
        },
      ],
    });
    await alert.present();
  }

  private async loadAppointments(): Promise<void> {
    this.isLoading = true;
    this.appointmentService.getAll().subscribe({
      next: async (appointments) => {
        this.appointments = appointments;
        this.activeAppointments = appointments.filter(
          (apt) =>
            apt.status === AppointmentStatus.PENDING ||
            apt.status === AppointmentStatus.CONFIRMED,
        );
        await this.loadStoresAndServices(appointments);
        this.isLoading = false;
      },
      error: async (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao carregar agendamentos';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  private async loadStoresAndServices(appointments: AppointmentOutput[]): Promise<void> {
    const storeIds = [...new Set(appointments.map((apt) => apt.storeId))];
    const serviceIds = [...new Set(appointments.map((apt) => apt.serviceId))];
    for (const storeId of storeIds) {
      try {
        this.storeService.getById(storeId).subscribe({
          next: (store) => {
            this.stores.set(storeId, store);
          },
        });
      } catch (error) {
        console.error(`Error loading store ${storeId}:`, error);
      }
    }
    for (const serviceId of serviceIds) {
      try {
        this.serviceService.getById(serviceId).subscribe({
          next: (service) => {
            this.services.set(serviceId, service);
          },
        });
      } catch (error) {
        console.error(`Error loading service ${serviceId}:`, error);
      }
    }
  }

  private async cancelAppointment(id: string): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Cancelando...',
    });
    await loading.present();
    this.appointmentService.cancel(id).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.loadAppointments();
        await this.showToast('Agendamento cancelado com sucesso!', 'success');
      },
      error: async (error) => {
        await loading.dismiss();
        const errorMessage = error.error?.message || 'Erro ao cancelar agendamento';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  private async deleteAppointment(id: string): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Excluindo...',
    });
    await loading.present();
    this.appointmentService.delete(id).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.loadAppointments();
        await this.showToast('Agendamento excluído com sucesso!', 'success');
      },
      error: async (error) => {
        await loading.dismiss();
        const errorMessage = error.error?.message || 'Erro ao excluir agendamento';
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

