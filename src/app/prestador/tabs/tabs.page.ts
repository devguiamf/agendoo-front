import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, IonContent } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, personOutline, settingsOutline, businessOutline } from 'ionicons/icons';

@Component({
  selector: 'app-prestador-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, IonContent],
})
export class PrestadorTabsPage {
  constructor() {
    addIcons({ homeOutline, personOutline, settingsOutline, businessOutline });
  }
}

