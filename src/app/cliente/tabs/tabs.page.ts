import { Component, EnvironmentInjector, inject } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, personOutline, calendarOutline } from 'ionicons/icons';

@Component({
  selector: 'app-cliente-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class ClienteTabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {
    addIcons({ searchOutline, personOutline, calendarOutline });
  }
}

