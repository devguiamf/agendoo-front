import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonList,
  IonSpinner,
  IonImg,
  IonSelect,
  IonSelectOption,
  IonDatetimeButton,
  IonModal,
  IonDatetime,
  IonTextarea,
  IonButtons,
  ToastController,
  LoadingController,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  timeOutline,
  calendarOutline,
  cashOutline,
  storefrontOutline,
  checkmarkCircleOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { StoreService } from '../../services/store.service';
import { ServiceService } from '../../services/service.service';
import { AppointmentService } from '../../services/appointment.service';
import { StoreOutput } from '../../models/store.types';
import { ServiceOutput } from '../../models/service.types';
import { AvailableTimeSlot, CreateAppointmentDto } from '../../models/appointment.types';
import { DatePickerModalComponent } from './date-picker-modal/date-picker-modal.component';
import { ServicePickerModalComponent } from './service-picker-modal/service-picker-modal.component';

@Component({
  selector: 'app-cliente-agendar',
  templateUrl: './agendar.page.html',
  styleUrls: ['./agendar.page.scss'],
  imports: [
    FormsModule,
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
    IonTextarea,
  ],
})
export class ClienteAgendarPage implements OnInit {
  public store: StoreOutput | null = null;
  public services: ServiceOutput[] = [];
  public availableTimeSlots: AvailableTimeSlot[] = [];
  public selectedServiceId: string = '';
  public selectedDate: string = '';
  public selectedTimeSlot: AvailableTimeSlot | null = null;
  public notes: string = '';
  public isLoading: boolean = false;
  public isLoadingServices: boolean = false;
  public isLoadingTimeSlots: boolean = false;
  public minDate: string = '';
  public maxDate: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly storeService: StoreService,
    private readonly serviceService: ServiceService,
    private readonly appointmentService: AppointmentService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
    private readonly modalController: ModalController,
  ) {
    addIcons({
      locationOutline,
      timeOutline,
      calendarOutline,
      cashOutline,
      storefrontOutline,
      checkmarkCircleOutline,
      documentTextOutline,
    });
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    this.maxDate = maxDate.toISOString().split('T')[0];
  }

  public ngOnInit(): void {
    const storeId = this.route.snapshot.paramMap.get('id');
    if (storeId) {
      this.loadStore(storeId);
      this.loadServices(storeId);
    }
  }

  public async openServiceModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: ServicePickerModalComponent,
      componentProps: {
        services: this.services,
        selectedServiceId: this.selectedServiceId,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.selectedServiceId) {
      this.selectedServiceId = data.selectedServiceId;
      this.onServiceChange();
    }
  }

  public onServiceChange(): void {
    this.selectedDate = '';
    this.selectedTimeSlot = null;
    this.availableTimeSlots = [];
    if (this.selectedServiceId && this.selectedDate) {
      this.loadAvailableTimeSlots();
    }
  }

  public async openDateModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: DatePickerModalComponent,
      componentProps: {
        selectedDate: this.selectedDate || this.minDate,
        minDate: this.minDate,
        maxDate: this.maxDate,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data && data.selectedDate) {
      const dateStr = this.formatDateForApi(data.selectedDate);
      this.selectedDate = dateStr;
      this.onDateChange();
    }
  }

  public onDateChange(): void {
    this.selectedTimeSlot = null;
    this.availableTimeSlots = [];
    if (this.selectedServiceId && this.selectedDate) {
      this.loadAvailableTimeSlots();
    }
  }

  private formatDateForApi(date: string): string {
    if (!date) {
      return '';
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  public onTimeSlotSelect(slot: AvailableTimeSlot): void {
    this.selectedTimeSlot = slot;
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

  public formatDate(date: string): string {
    if (!date) {
      return '';
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      weekday: 'long',
    }).format(dateObj);
  }

  public formatAddress(location: StoreOutput['location']): string {
    return `${location.street}, ${location.number} - ${location.neighborhood}, ${location.city} - ${location.state}`;
  }

  public getStoreImage(store: StoreOutput): string | null {
    return store.imageBase64 || store.imageUrl || null;
  }

  public getSelectedService(): ServiceOutput | null {
    return this.services.find((s) => s.id === this.selectedServiceId) || null;
  }

  public canConfirmAppointment(): boolean {
    return !!(this.selectedServiceId && this.selectedDate && this.selectedTimeSlot);
  }

  public async confirmAppointment(): Promise<void> {
    if (!this.canConfirmAppointment() || !this.store) {
      await this.showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Agendando...',
    });
    await loading.present();
    const selectedService = this.getSelectedService();
    if (!selectedService || !this.selectedTimeSlot) {
      await loading.dismiss();
      return;
    }
    const appointmentDate = new Date(`${this.selectedDate}T${this.selectedTimeSlot.startTime}:00`);
    const createDto: CreateAppointmentDto = {
      storeId: this.store.id,
      serviceId: this.selectedServiceId,
      appointmentDate: appointmentDate.toISOString(),
      notes: this.notes || undefined,
    };
    this.appointmentService.create(createDto).subscribe({
      next: async () => {
        await loading.dismiss();
        await this.showToast('Agendamento realizado com sucesso!', 'success');
        this.router.navigate(['/cliente/agendamentos']);
      },
      error: async (error) => {
        await loading.dismiss();
        const errorMessage = error.error?.message || 'Erro ao realizar agendamento';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  private async loadStore(storeId: string): Promise<void> {
    this.isLoading = true;
    this.storeService.getById(storeId).subscribe({
      next: (store) => {
        this.store = store;
        this.isLoading = false;
      },
      error: async (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao carregar estabelecimento';
        await this.showToast(errorMessage, 'danger');
        this.router.navigate(['/cliente/busca']);
      },
    });
  }

  private async loadServices(storeId: string): Promise<void> {
    this.isLoadingServices = true;
    this.serviceService.getByStoreId(storeId).subscribe({
      next: (services) => {
        this.services = services;
        this.isLoadingServices = false;
      },
      error: async (error) => {
        this.isLoadingServices = false;
        const errorMessage = error.error?.message || 'Erro ao carregar serviços';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  private async loadAvailableTimeSlots(): Promise<void> {
    if (!this.selectedServiceId || !this.selectedDate || !this.store) {
      return;
    }
    this.isLoadingTimeSlots = true;
    const dateStr = this.formatDateForApi(this.selectedDate);
    this.appointmentService
      .getAvailableTimeSlots(this.store.id, this.selectedServiceId, dateStr)
      .subscribe({
        next: (slots) => {
          this.availableTimeSlots = slots;
          this.isLoadingTimeSlots = false;
        },
        error: async (error) => {
          this.isLoadingTimeSlots = false;
          const errorMessage = error.error?.message || 'Erro ao carregar horários disponíveis';
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

