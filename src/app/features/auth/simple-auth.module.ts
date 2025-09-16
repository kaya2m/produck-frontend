import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SimpleLoginComponent } from './components/simple-login.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: SimpleLoginComponent }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SimpleLoginComponent,
    RouterModule.forChild(routes)
  ]
})
export class SimpleAuthModule { }