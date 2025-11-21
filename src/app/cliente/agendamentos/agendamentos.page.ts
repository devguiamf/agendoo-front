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
  locationOutline,
  documentTextOutline,
  closeCircleOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentOutput, AppointmentStatus } from '../../models/appointment.types';
import { UserService } from '../../services/user.service';
import { StoreOutput } from '../../models/store.types';
import { ServiceOutput } from '../../models/service.types';
import { UserOutput } from '../../models/user.types';

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
  public storeOwners: Map<string, UserOutput> = new Map();
  public isLoading: boolean = false;

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly userService: UserService,
    private readonly toastController: ToastController,
    private readonly alertController: AlertController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({
      calendarOutline,
      locationOutline,
      documentTextOutline,
      closeCircleOutline,
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

  public getStoreName(appointment: AppointmentOutput): string {
    return appointment.store?.name || 'Estabelecimento não encontrado';
  }

  public getServiceName(appointment: AppointmentOutput): string {
    return appointment.service?.title || 'Serviço não encontrado';
  }

  public getStoreAddress(appointment: AppointmentOutput): string {
    const store = appointment.store;
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
    const store = appointment.store;
    const storeOwner = store ? this.storeOwners.get(store.userId) : null;
    const phone = storeOwner?.phone;
    const storeName = store?.name || 'o estabelecimento';
    const message = phone
      ? `Para solicitar o cancelamento do agendamento de ${this.formatDateTime(appointment.appointmentDate)}, entre em contato com ${storeName} via WhatsApp.`
      : `Para solicitar o cancelamento do agendamento de ${this.formatDateTime(appointment.appointmentDate)}, entre em contato com ${storeName}.`;
    const alert = await this.alertController.create({
      header: 'Solicitar Cancelamento',
      message,
      buttons: [
        {
          text: 'Fechar',
          role: 'cancel',
        },
        ...(phone
          ? [
              {
                text: 'Abrir WhatsApp',
                handler: () => {
                  this.openWhatsApp(phone, appointment);
                },
              },
            ]
          : []),
      ],
    });
    await alert.present();
  }

  public openWhatsApp(phone: string, appointment: AppointmentOutput): void {
    const storeName = this.getStoreName(appointment);
    const serviceName = this.getServiceName(appointment);
    const dateTime = this.formatDateTime(appointment.appointmentDate);
    const message = encodeURIComponent(
      `Olá! Gostaria de solicitar o cancelamento do meu agendamento:\n\n` +
        `Serviço: ${serviceName}\n` +
        `Data e Hora: ${dateTime}\n\n` +
        `Por favor, confirme o cancelamento.`,
    );
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
        await this.loadStoreOwners(appointments);
        this.isLoading = false;
      },
      error: async (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao carregar agendamentos';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  private async loadStoreOwners(appointments: AppointmentOutput[]): Promise<void> {
    const userIds = new Set<string>();
    appointments.forEach((apt) => {
      if (apt.store?.userId) {
        userIds.add(apt.store.userId);
      }
    });
    for (const userId of userIds) {
      if (!this.storeOwners.has(userId)) {
        try {
          this.userService.getById(userId).subscribe({
            next: (user) => {
              this.storeOwners.set(userId, user);
            },
            error: (error) => {
              console.error(`Error loading store owner ${userId}:`, error);
            },
          });
        } catch (error) {
          console.error(`Error loading store owner ${userId}:`, error);
        }
      }
    }
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

