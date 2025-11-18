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
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  documentTextOutline,
  cashOutline,
  timeOutline,
  imageOutline,
  linkOutline,
} from 'ionicons/icons';
import { ServiceService } from '../../../services/service.service';
import {
  ServiceOutput,
  CreateServiceDto,
  UpdateServiceDto,
} from '../../../models/service.types';

@Component({
  selector: 'app-editar-servico-modal',
  templateUrl: './editar-servico-modal.component.html',
  styleUrls: ['./editar-servico-modal.component.scss'],
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
  ],
})
export class EditarServicoModalComponent implements OnInit {
  @Input() public service: ServiceOutput | null = null;
  public isEditMode: boolean = false;
  public serviceForm: CreateServiceDto = {
    title: '',
    description: '',
    price: 0,
    durationMinutes: 30,
    imageUrl: '',
  };
  public isLoading: boolean = false;
  public selectedImageFile: File | null = null;
  public imagePreview: string | null = null;

  constructor(
    private readonly modalController: ModalController,
    private readonly serviceService: ServiceService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({
      closeOutline,
      documentTextOutline,
      cashOutline,
      timeOutline,
      imageOutline,
      linkOutline,
    });
  }

  public ngOnInit(): void {
    if (this.service) {
      this.isEditMode = true;
      this.serviceForm = {
        title: this.service.title || '',
        description: this.service.description || '',
        price: this.service.price || 0,
        durationMinutes: this.service.durationMinutes || 30,
        imageUrl: this.service.imageUrl || '',
      };
      if (this.service.imageUrl) {
        this.imagePreview = this.service.imageUrl;
      }
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
    if (this.isEditMode && this.service) {
      const updateDto: UpdateServiceDto = {
        title: this.serviceForm.title,
        description: this.serviceForm.description,
        price: this.serviceForm.price,
        durationMinutes: this.serviceForm.durationMinutes,
        imageUrl: this.selectedImageFile ? undefined : (this.serviceForm.imageUrl || undefined),
      };
      this.serviceService.update(this.service.id, updateDto, this.selectedImageFile || undefined).subscribe({
        next: async () => {
          await loading.dismiss();
          this.isLoading = false;
          await this.modalController.dismiss({ updated: true });
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Erro ao atualizar serviço';
          await this.showToast(errorMessage, 'danger');
        },
      });
    } else {
      const createDto: CreateServiceDto = {
        title: this.serviceForm.title,
        description: this.serviceForm.description,
        price: this.serviceForm.price,
        durationMinutes: this.serviceForm.durationMinutes,
        imageUrl: this.selectedImageFile ? undefined : (this.serviceForm.imageUrl || undefined),
      };
      this.serviceService.create(createDto, this.selectedImageFile || undefined).subscribe({
        next: async () => {
          await loading.dismiss();
          this.isLoading = false;
          await this.modalController.dismiss({ updated: true });
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Erro ao criar serviço';
          await this.showToast(errorMessage, 'danger');
        },
      });
    }
  }

  public onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type.startsWith('image/')) {
        this.selectedImageFile = file;
        this.serviceForm.imageUrl = '';
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.showToast('Por favor, selecione um arquivo de imagem', 'warning');
        input.value = '';
      }
    }
  }

  public removeSelectedImage(): void {
    this.selectedImageFile = null;
    this.imagePreview = this.serviceForm.imageUrl || null;
  }

  public async handleCancel(): Promise<void> {
    await this.modalController.dismiss({ updated: false });
  }

  private validateForm(): boolean {
    if (!this.serviceForm.title || this.serviceForm.title.length < 2) {
      this.showToast('Título deve ter no mínimo 2 caracteres', 'warning');
      return false;
    }
    if (!this.serviceForm.description || this.serviceForm.description.length < 10) {
      this.showToast('Descrição deve ter no mínimo 10 caracteres', 'warning');
      return false;
    }
    if (!this.serviceForm.price || this.serviceForm.price <= 0) {
      this.showToast('Preço deve ser maior que zero', 'warning');
      return false;
    }
    if (!this.serviceForm.durationMinutes || this.serviceForm.durationMinutes < 1 || this.serviceForm.durationMinutes > 1440) {
      this.showToast('Duração deve estar entre 1 e 1440 minutos', 'warning');
      return false;
    }
    return true;
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

