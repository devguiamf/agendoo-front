import { Component, Input } from '@angular/core';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonContent,
  IonCard,
  IonImg,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { documentTextOutline, checkmarkCircle } from 'ionicons/icons';
import { ServiceOutput } from '../../../models/service.types';

@Component({
  selector: 'app-service-picker-modal',
  templateUrl: './service-picker-modal.component.html',
  styleUrls: ['./service-picker-modal.component.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonContent,
    IonCard,
    IonImg,
    IonIcon,
  ],
})
export class ServicePickerModalComponent {
  @Input() public services: ServiceOutput[] = [];
  @Input() public selectedServiceId: string = '';
  public selectedService: ServiceOutput | null = null;

  constructor(private readonly modalController: ModalController) {
    addIcons({ documentTextOutline, checkmarkCircle });
  }

  public selectService(service: ServiceOutput): void {
    this.selectedService = service;
    this.selectedServiceId = service.id;
  }

  public isSelected(serviceId: string): boolean {
    return this.selectedServiceId === serviceId;
  }

  public async confirm(): Promise<void> {
    if (this.selectedService) {
      await this.modalController.dismiss({ selectedServiceId: this.selectedService.id });
    } else {
      await this.modalController.dismiss();
    }
  }

  public async cancel(): Promise<void> {
    await this.modalController.dismiss();
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

  public getServiceImage(service: ServiceOutput): string | null {
    return service.imageBase64 || service.imageUrl || null;
  }
}

