import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonList,
  IonChip,
  IonRefresher,
  IonRefresherContent,
  ToastController,
  LoadingController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  timeOutline,
  personOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
  chevronForwardOutline,
  chevronBackOutline,
  todayOutline,
  cashOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { AppointmentService } from '../../services/appointment.service';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';
import { AppointmentOutput, AppointmentStatus } from '../../models/appointment.types';

type FilterStatus = 'all' | AppointmentStatus;

@Component({
  selector: 'app-prestador-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonLabel,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSegment,
    IonSegmentButton,
    IonBadge,
    IonList,
    IonChip,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class PrestadorHomePage implements OnInit {
  public appointments: AppointmentOutput[] = [];
  public filteredAppointments: AppointmentOutput[] = [];
  public isLoading: boolean = false;
  public hasStore: boolean = false;
  public selectedDate: Date = new Date();
  public selectedStatus: FilterStatus = 'all';
  public showFutureAppointments: boolean = false;

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly storeService: StoreService,
    private readonly authService: AuthService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
    private readonly alertController: AlertController,
  ) {
    addIcons({
      calendarOutline,
      timeOutline,
      personOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      hourglassOutline,
      chevronForwardOutline,
      chevronBackOutline,
      todayOutline,
      cashOutline,
      alertCircleOutline,
    });
  }

  public ngOnInit(): void {
    this.checkStoreAndLoadAppointments();
  }

  public async handleRefresh(event: any): Promise<void> {
    await this.loadAppointments();
    event.target.complete();
  }

  public previousDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    this.selectedDate = newDate;
    this.loadAppointments();
  }

  public nextDay(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    this.selectedDate = newDate;
    this.loadAppointments();
  }

  public goToToday(): void {
    this.selectedDate = new Date();
    this.loadAppointments();
  }

  public isToday(): boolean {
    const today = new Date();
    return (
      this.selectedDate.getDate() === today.getDate() &&
      this.selectedDate.getMonth() === today.getMonth() &&
      this.selectedDate.getFullYear() === today.getFullYear()
    );
  }

  public onStatusFilterChange(event: any): void {
    this.selectedStatus = event.detail.value;
    this.applyFilters();
  }

  public toggleFutureAppointments(): void {
    this.showFutureAppointments = !this.showFutureAppointments;
    this.loadAppointments();
  }

  public formatDate(date: Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    }).format(dateObj);
  }

  public formatTime(date: Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  }

  public formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }

  public getStatusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'Pendente',
      [AppointmentStatus.CONFIRMED]: 'Confirmado',
      [AppointmentStatus.COMPLETED]: 'Concluído',
      [AppointmentStatus.CANCELLED]: 'Cancelado',
    };
    return labels[status] || status;
  }

  public getStatusColor(status: AppointmentStatus): string {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'warning',
      [AppointmentStatus.CONFIRMED]: 'primary',
      [AppointmentStatus.COMPLETED]: 'success',
      [AppointmentStatus.CANCELLED]: 'danger',
    };
    return colors[status] || 'medium';
  }

  public getStatusIcon(status: AppointmentStatus): string {
    const icons: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'hourglass-outline',
      [AppointmentStatus.CONFIRMED]: 'checkmark-circle-outline',
      [AppointmentStatus.COMPLETED]: 'checkmark-circle-outline',
      [AppointmentStatus.CANCELLED]: 'close-circle-outline',
    };
    return icons[status] || 'alert-circle-outline';
  }

  public get pendingCount(): number {
    return this.appointments.filter((a) => a.status === AppointmentStatus.PENDING).length;
  }

  public get confirmedCount(): number {
    return this.appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length;
  }

  public get completedCount(): number {
    return this.appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length;
  }

  public get cancelledCount(): number {
    return this.appointments.filter((a) => a.status === AppointmentStatus.CANCELLED).length;
  }

  public async confirmAppointment(appointment: AppointmentOutput): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar Agendamento',
      message: `Deseja confirmar o agendamento de ${appointment.user?.name || 'Cliente'}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => this.updateAppointmentStatus(appointment.id, 'confirm'),
        },
      ],
    });
    await alert.present();
  }

  public async completeAppointment(appointment: AppointmentOutput): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Concluir Agendamento',
      message: `Deseja marcar o agendamento de ${appointment.user?.name || 'Cliente'} como concluído?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Concluir',
          handler: () => this.updateAppointmentStatus(appointment.id, 'complete'),
        },
      ],
    });
    await alert.present();
  }

  public async cancelAppointment(appointment: AppointmentOutput): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cancelar Agendamento',
      message: `Deseja cancelar o agendamento de ${appointment.user?.name || 'Cliente'}?`,
      buttons: [
        { text: 'Voltar', role: 'cancel' },
        {
          text: 'Cancelar Agendamento',
          role: 'destructive',
          handler: () => this.updateAppointmentStatus(appointment.id, 'cancel'),
        },
      ],
    });
    await alert.present();
  }

  private async checkStoreAndLoadAppointments(): Promise<void> {
    const user = this.authService.getUser();
    if (!user) {
      return;
    }
    this.isLoading = true;
    this.storeService.getByUserId(user.id).subscribe({
      next: () => {
        this.hasStore = true;
        this.loadAppointments();
      },
      error: (error) => {
        if (error.status === 404) {
          this.hasStore = false;
        }
        this.isLoading = false;
      },
    });
  }

  private async loadAppointments(): Promise<void> {
    this.isLoading = true;
    const dateStr = this.selectedDate.toISOString().split('T')[0];
    const options = this.showFutureAppointments
      ? { includeFuture: true }
      : { date: dateStr };
    this.appointmentService.getMyStoreAppointments(options).subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.applyFilters();
        this.isLoading = false;
      },
      error: async (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao carregar agendamentos';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  private applyFilters(): void {
    if (this.selectedStatus === 'all') {
      this.filteredAppointments = [...this.appointments];
    } else {
      this.filteredAppointments = this.appointments.filter(
        (a) => a.status === this.selectedStatus,
      );
    }
  }

  private async updateAppointmentStatus(
    id: string,
    action: 'confirm' | 'complete' | 'cancel',
  ): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Atualizando...',
    });
    await loading.present();
    let observable;
    let successMessage: string;
    switch (action) {
      case 'confirm':
        observable = this.appointmentService.confirm(id);
        successMessage = 'Agendamento confirmado!';
        break;
      case 'complete':
        observable = this.appointmentService.complete(id);
        successMessage = 'Agendamento concluído!';
        break;
      case 'cancel':
        observable = this.appointmentService.cancel(id);
        successMessage = 'Agendamento cancelado!';
        break;
    }
    observable.subscribe({
      next: async () => {
        await loading.dismiss();
        await this.showToast(successMessage, 'success');
        await this.loadAppointments();
      },
      error: async (error) => {
        await loading.dismiss();
        const errorMessage = error.error?.message || 'Erro ao atualizar agendamento';
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
