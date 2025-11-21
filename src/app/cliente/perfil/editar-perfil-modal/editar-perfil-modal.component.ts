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
  personOutline,
  mailOutline,
  callOutline,
  documentTextOutline,
} from 'ionicons/icons';
import { UserService, UpdateUserDto } from '../../../services/user.service';
import { UserOutput } from '../../../models/user.types';

@Component({
  selector: 'app-editar-perfil-modal',
  templateUrl: './editar-perfil-modal.component.html',
  styleUrls: ['./editar-perfil-modal.component.scss'],
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
export class EditarPerfilModalComponent implements OnInit {
  @Input() public user!: UserOutput;
  public editForm: UpdateUserDto = {
    name: '',
    email: '',
    phone: '',
    cpf: '',
  };
  public isLoading: boolean = false;

  constructor(
    private readonly modalController: ModalController,
    private readonly userService: UserService,
    private readonly toastController: ToastController,
    private readonly loadingController: LoadingController,
  ) {
    addIcons({
      closeOutline,
      personOutline,
      mailOutline,
      callOutline,
      documentTextOutline,
    });
  }

  public ngOnInit(): void {
    const cpf = this.user.cpf || '';
    const formattedCpf = cpf ? this.formatCpfForDisplay(cpf) : '';
    this.editForm = {
      name: this.user.name || '',
      email: this.user.email || '',
      phone: this.user.phone || '',
      cpf: formattedCpf,
    };
  }

  private formatCpfForDisplay(cpf: string): string {
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length === 11) {
      return `${cleanCpf.substring(0, 3)}.${cleanCpf.substring(3, 6)}.${cleanCpf.substring(6, 9)}-${cleanCpf.substring(9)}`;
    }
    return cpf;
  }

  public onCpfInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) {
      value = value.substring(0, 11);
    }
    let formattedValue = value;
    if (value.length <= 11) {
      if (value.length > 9) {
        formattedValue = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6, 9)}-${value.substring(9)}`;
      } else if (value.length > 6) {
        formattedValue = `${value.substring(0, 3)}.${value.substring(3, 6)}.${value.substring(6)}`;
      } else if (value.length > 3) {
        formattedValue = `${value.substring(0, 3)}.${value.substring(3)}`;
      }
    }
    this.editForm.cpf = formattedValue;
    input.value = formattedValue;
  }

  public async handleSave(): Promise<void> {
    if (!this.editForm.name || !this.editForm.email) {
      await this.showToast('Nome e e-mail são obrigatórios', 'warning');
      return;
    }
    const loading = await this.loadingController.create({
      message: 'Salvando...',
    });
    await loading.present();
    this.isLoading = true;
    const updateDto: UpdateUserDto = {
      name: this.editForm.name,
      email: this.editForm.email,
      phone: this.editForm.phone || undefined,
      cpf: this.editForm.cpf || undefined,
    };
    this.userService.update(this.user.id, updateDto).subscribe({
      next: async () => {
        await loading.dismiss();
        this.isLoading = false;
        await this.modalController.dismiss({ updated: true });
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao atualizar perfil';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  public async handleCancel(): Promise<void> {
    await this.modalController.dismiss({ updated: false });
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

