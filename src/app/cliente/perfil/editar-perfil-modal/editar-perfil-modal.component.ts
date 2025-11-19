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
  lockClosedOutline,
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
  public newPassword: string = '';
  public confirmPassword: string = '';
  public passwordMismatch: boolean = false;
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
      lockClosedOutline,
    });
  }

  public ngOnInit(): void {
    this.editForm = {
      name: this.user.name || '',
      email: this.user.email || '',
      phone: this.user.phone || '',
      cpf: this.user.cpf || '',
    };
  }

  public validatePasswords(): void {
    this.passwordMismatch =
      this.newPassword !== this.confirmPassword && this.confirmPassword.length > 0;
  }

  public async handleSave(): Promise<void> {
    if (!this.editForm.name || !this.editForm.email) {
      await this.showToast('Nome e e-mail são obrigatórios', 'warning');
      return;
    }
    if (this.newPassword) {
      if (this.newPassword.length < 6) {
        await this.showToast('A senha deve ter no mínimo 6 caracteres', 'warning');
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.passwordMismatch = true;
        await this.showToast('As senhas não coincidem', 'warning');
        return;
      }
      this.editForm.password = this.newPassword;
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
      password: this.editForm.password,
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

