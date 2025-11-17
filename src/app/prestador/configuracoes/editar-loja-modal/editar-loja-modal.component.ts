import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ModalController,
  ToastController,
  LoadingController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonButtons,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  storefrontOutline,
  locationOutline,
  timeOutline,
  calendarOutline,
  imageOutline,
} from 'ionicons/icons';
import { StoreService } from '../../../services/store.service';
import {
  StoreOutput,
  CreateStoreDto,
  UpdateStoreDto,
  WorkingHours,
  Location,
  AppointmentInterval,
} from '../../../models/store.types';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-editar-loja-modal',
  templateUrl: './editar-loja-modal.component.html',
  styleUrls: ['./editar-loja-modal.component.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonButtons,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
  ],
})
export class EditarLojaModalComponent implements OnInit {
  @Input() public store: StoreOutput | null = null;
  public isEditMode: boolean = false;
  public storeForm: CreateStoreDto = {
    name: '',
    userId: '',
    workingHours: [],
    location: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    },
    appointmentInterval: AppointmentInterval.THIRTY_MINUTES,
    imageUrl: '',
  };
  public isLoading: boolean = false;
  public daysOfWeek: Array<{ value: number; label: string }> = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
  ];
  public appointmentIntervals: Array<{ value: AppointmentInterval; label: string }> = [
    { value: AppointmentInterval.FIVE_MINUTES, label: '5 minutos' },
    { value: AppointmentInterval.TEN_MINUTES, label: '10 minutos' },
    { value: AppointmentInterval.FIFTEEN_MINUTES, label: '15 minutos' },
    { value: AppointmentInterval.THIRTY_MINUTES, label: '30 minutos' },
  ];

  constructor(
    private readonly modalController: ModalController,
    private readonly storeService: StoreService,
    private readonly authService: AuthService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({
      closeOutline,
      storefrontOutline,
      locationOutline,
      timeOutline,
      calendarOutline,
      imageOutline,
    });
  }

  public ngOnInit(): void {
    const currentUser = this.authService.getUser();
    if (!currentUser) {
      return;
    }
    if (this.store) {
      this.isEditMode = true;
      this.storeForm = {
        name: this.store.name || '',
        userId: this.store.userId,
        workingHours: this.store.workingHours.map((wh) => ({ ...wh })),
        location: { ...this.store.location },
        appointmentInterval: this.store.appointmentInterval,
        imageUrl: this.store.imageUrl || '',
      };
    } else {
      this.storeForm.userId = currentUser.id;
      this.storeForm.workingHours = this.initializeWorkingHours();
    }
  }

  public getWorkingHoursForDay(dayOfWeek: number): WorkingHours {
    return (
      this.storeForm.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek) ||
      this.initializeWorkingHours()[dayOfWeek]
    );
  }

  public updateWorkingHoursDay(dayOfWeek: number, field: 'isOpen' | 'openTime' | 'closeTime', value: boolean | string | null | undefined): void {
    let wh = this.storeForm.workingHours.find((w) => w.dayOfWeek === dayOfWeek);
    if (!wh) {
      wh = { dayOfWeek, isOpen: false };
      this.storeForm.workingHours.push(wh);
    }
    if (field === 'isOpen') {
      wh.isOpen = value as boolean;
      if (!wh.isOpen) {
        wh.openTime = undefined;
        wh.closeTime = undefined;
      }
    } else if (field === 'openTime') {
      wh.openTime = (value as string) || undefined;
    } else if (field === 'closeTime') {
      wh.closeTime = (value as string) || undefined;
    }
  }

  public async handleSave(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Salvando...',
    });
    await loading.present();
    this.isLoading = true;
    if (this.isEditMode && this.store) {
      const updateDto: UpdateStoreDto = {
        name: this.storeForm.name,
        workingHours: this.storeForm.workingHours,
        location: this.storeForm.location,
        appointmentInterval: this.storeForm.appointmentInterval,
        imageUrl: this.storeForm.imageUrl || undefined,
      };
      this.storeService.update(this.store.id, updateDto).subscribe({
        next: async () => {
          await loading.dismiss();
          this.isLoading = false;
          await this.modalController.dismiss({ updated: true });
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Erro ao atualizar loja';
          await this.showToast(errorMessage, 'danger');
        },
      });
    } else {
      const createDto: CreateStoreDto = {
        name: this.storeForm.name,
        userId: this.storeForm.userId,
        workingHours: this.storeForm.workingHours,
        location: this.storeForm.location,
        appointmentInterval: this.storeForm.appointmentInterval,
        imageUrl: this.storeForm.imageUrl || undefined,
      };
      this.storeService.create(createDto).subscribe({
        next: async () => {
          await loading.dismiss();
          this.isLoading = false;
          await this.modalController.dismiss({ updated: true });
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Erro ao criar loja';
          await this.showToast(errorMessage, 'danger');
        },
      });
    }
  }

  public async handleCancel(): Promise<void> {
    await this.modalController.dismiss({ updated: false });
  }

  private validateForm(): boolean {
    if (!this.storeForm.name || this.storeForm.name.length < 2) {
      this.showToast('Nome da loja deve ter no mínimo 2 caracteres', 'warning');
      return false;
    }
    if (!this.storeForm.location.street || this.storeForm.location.street.length < 3) {
      this.showToast('Rua deve ter no mínimo 3 caracteres', 'warning');
      return false;
    }
    if (!this.storeForm.location.number) {
      this.showToast('Número é obrigatório', 'warning');
      return false;
    }
    if (!this.storeForm.location.neighborhood || this.storeForm.location.neighborhood.length < 2) {
      this.showToast('Bairro deve ter no mínimo 2 caracteres', 'warning');
      return false;
    }
    if (!this.storeForm.location.city || this.storeForm.location.city.length < 2) {
      this.showToast('Cidade deve ter no mínimo 2 caracteres', 'warning');
      return false;
    }
    if (!this.storeForm.location.state || this.storeForm.location.state.length !== 2) {
      this.showToast('Estado deve ter 2 caracteres', 'warning');
      return false;
    }
    if (!this.storeForm.location.zipCode) {
      this.showToast('CEP é obrigatório', 'warning');
      return false;
    }
    if (this.storeForm.workingHours.length !== 7) {
      this.showToast('Deve haver horários para todos os 7 dias da semana', 'warning');
      return false;
    }
    const daysOfWeek = new Set(this.storeForm.workingHours.map((wh) => wh.dayOfWeek));
    if (daysOfWeek.size !== 7) {
      this.showToast('Cada dia da semana deve aparecer apenas uma vez', 'warning');
      return false;
    }
    for (const wh of this.storeForm.workingHours) {
      if (wh.isOpen && (!wh.openTime || !wh.closeTime)) {
        this.showToast('Horários de abertura e fechamento são obrigatórios quando a loja está aberta', 'warning');
        return false;
      }
    }
    return true;
  }

  private initializeWorkingHours(): WorkingHours[] {
    return [
      { dayOfWeek: 0, isOpen: false },
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '14:00' },
    ];
  }

  private initializeLocation(): Location {
    return {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: '',
    };
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

