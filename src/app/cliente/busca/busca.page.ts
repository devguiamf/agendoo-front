import { Component, OnInit } from '@angular/core';
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
  IonIcon,
  IonSpinner,
  IonImg,
  IonSearchbar,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  timeOutline,
  calendarOutline,
  searchOutline,
  storefrontOutline,
} from 'ionicons/icons';
import { StoreService } from '../../services/store.service';
import { StoreOutput } from '../../models/store.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cliente-busca',
  templateUrl: './busca.page.html',
  styleUrls: ['./busca.page.scss'],
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
    IonIcon,
    IonSpinner,
    IonImg,
    IonSearchbar,
  ],
})
export class ClienteBuscaPage implements OnInit {
  public stores: StoreOutput[] = [];
  public filteredStores: StoreOutput[] = [];
  public isLoading: boolean = false;
  public searchTerm: string = '';

  constructor(
    private readonly storeService: StoreService,
    private readonly router: Router,
    private readonly toastController: ToastController,
  ) {
    addIcons({
      locationOutline,
      timeOutline,
      calendarOutline,
      searchOutline,
      storefrontOutline,
    });
  }

  public ngOnInit(): void {
    this.loadStores();
  }

  public onSearchChange(event: CustomEvent): void {
    this.searchTerm = event.detail.value || '';
    this.filterStores();
  }

  public onStoreClick(store: StoreOutput): void {
    this.router.navigate(['/cliente/agendar', store.id]);
  }

  public formatAddress(location: StoreOutput['location']): string {
    return `${location.street}, ${location.number} - ${location.neighborhood}, ${location.city} - ${location.state}`;
  }

  public formatAddressCompact(location: StoreOutput['location']): string {
    return `${location.neighborhood}, ${location.city}`;
  }

  public getWorkingHoursToday(store: StoreOutput): string {
    const today = new Date().getDay();
    const workingHours = store.workingHours.find((wh) => wh.dayOfWeek === today);
    if (!workingHours || !workingHours.isOpen) {
      return 'Fechado hoje';
    }
    return `${workingHours.openTime} - ${workingHours.closeTime}`;
  }

  public getStoreImage(store: StoreOutput): string | null {
    return store.imageBase64 || null;
  }

  private async loadStores(): Promise<void> {
    this.isLoading = true;
    this.storeService.getAll(this.searchTerm).subscribe({
      next: (stores) => {
        this.stores = stores;
        this.filteredStores = stores;
        this.isLoading = false;
      },
      error: async (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Erro ao carregar estabelecimentos';
        await this.showToast(errorMessage, 'danger');
      },
    });
  }

  private filterStores(): void {
    this.loadStores();
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

