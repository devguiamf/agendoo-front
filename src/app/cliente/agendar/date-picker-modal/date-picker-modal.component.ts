import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ModalController,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-date-picker-modal',
  templateUrl: './date-picker-modal.component.html',
  styleUrls: ['./date-picker-modal.component.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonContent,
    IonDatetime,
  ],
})
export class DatePickerModalComponent {
  @Input() public selectedDate: string = '';
  @Input() public minDate: string = '';
  @Input() public maxDate: string = '';

  constructor(private readonly modalController: ModalController) {}

  public async confirm(): Promise<void> {
    if (this.selectedDate) {
      const dateStr = typeof this.selectedDate === 'string' 
        ? this.selectedDate.split('T')[0] 
        : new Date(this.selectedDate).toISOString().split('T')[0];
      await this.modalController.dismiss({ selectedDate: dateStr });
    } else {
      await this.modalController.dismiss();
    }
  }

  public async cancel(): Promise<void> {
    await this.modalController.dismiss();
  }
}

