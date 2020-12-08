import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from './material.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';

import { ChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';
import { AssetsComponent } from './assets/assets.component';
import { LiabilitiesComponent } from './liabilities/liabilities.component';
import { BudgetComponent } from './budget/budget.component';
import { GoalsComponent } from './goals/goals.component';
import { HeaderComponent } from './header/header.component';
import { ComponentSelectorComponent } from './shared/component-selector/component-selector.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { GraphComponent } from './shared/graph/graph.component';
import { LoadingNoticeComponent } from './shared/loading-notice/loading-notice.component';

@NgModule({
  declarations: [
    AppComponent,
    AssetsComponent,
    LiabilitiesComponent,
    BudgetComponent,
    GoalsComponent,
    HeaderComponent,
    ComponentSelectorComponent,
    GraphComponent,
    LoadingNoticeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAnalyticsModule,
    ChartsModule
  ],
  providers: [CurrencyPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
