import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// Angular CDK
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ClipboardModule } from '@angular/cdk/clipboard';

// AG-Grid
import { AgGridAngular } from 'ag-grid-angular';

// Custom UI Components
import { InputComponent } from './components/ui/input/input.component';
import { ButtonComponent } from './components/ui/button/button.component';
import { CardComponent } from './components/ui/card/card.component';
import { ModalComponent } from './components/ui/modal/modal.component';
import { TableComponent } from './components/ui/table/table.component';

// Custom Pipes
import { CrmCurrencyPipe, PercentagePipe } from './pipes/currency.pipe';

const MATERIAL_MODULES = [
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule,
  MatRadioModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatIconModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatMenuModule,
  MatDialogModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatTabsModule,
  MatExpansionModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatBadgeModule,
  MatTooltipModule,
  MatSlideToggleModule
];

const CDK_MODULES = [
  DragDropModule,
  LayoutModule,
  ScrollingModule,
  ClipboardModule
];

const THIRD_PARTY_MODULES = [
  AgGridAngular
];

const CUSTOM_COMPONENTS = [
  InputComponent,
  ButtonComponent,
  CardComponent,
  ModalComponent,
  TableComponent
];

const CUSTOM_PIPES = [
  CrmCurrencyPipe,
  PercentagePipe
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES,
    ...CDK_MODULES,
    ...THIRD_PARTY_MODULES,
    ...CUSTOM_COMPONENTS,
    ...CUSTOM_PIPES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...MATERIAL_MODULES,
    ...CDK_MODULES,
    ...THIRD_PARTY_MODULES,
    ...CUSTOM_COMPONENTS,
    ...CUSTOM_PIPES
  ]
})
export class SharedModule { }