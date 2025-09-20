import { Component, inject, signal, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { Opportunity, OpportunityCreateDto, OpportunityUpdateDto, SalesStage, OpportunityType } from '../../../core/models/opportunity.models.js';
import { OpportunityService } from '../../../core/services/opportunity.service.js';
import { Account } from '../../../core/models/account.models.js';
import { Contact } from '../../../core/models/contact.models.js';
import { UserDto } from '../../../core/models/user-management.models.js';

export interface OpportunityFormDialogData {
  opportunity?: Opportunity;
  isEdit?: boolean;
}

@Component({
  selector: 'app-opportunity-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="form-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon class="header-icon">{{ isEdit ? 'edit' : 'add_business' }}</mat-icon>
        <div class="header-content">
          <h2>{{ isEdit ? 'Opportunity Düzenle' : 'Yeni Opportunity' }}</h2>
          <p>{{ isEdit ? 'Opportunity bilgilerini güncelleyin' : 'Yeni satış fırsatı oluşturun' }}</p>
        </div>
      </div>

      <mat-dialog-content class="dialog-content">
        <form [formGroup]="opportunityForm" class="opportunity-form">
          <!-- Basic Information -->
          <div class="form-section">
            <h3 class="section-title">Temel Bilgiler</h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Opportunity Adı</mat-label>
              <input matInput formControlName="name" placeholder="Satış fırsatı adını girin">
              <mat-icon matPrefix>star</mat-icon>
              @if (opportunityForm.get('name')?.hasError('required') && opportunityForm.get('name')?.touched) {
                <mat-error>Opportunity adı gereklidir</mat-error>
              }
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Account</mat-label>
                <mat-select formControlName="accountId">
                  @for (account of accounts(); track account.id) {
                    <mat-option [value]="account.id">{{ account.name }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>business</mat-icon>
                @if (opportunityForm.get('accountId')?.hasError('required') && opportunityForm.get('accountId')?.touched) {
                  <mat-error>Account seçimi gereklidir</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Primary Contact</mat-label>
                <mat-select formControlName="primaryContactId">
                  <mat-option value="">Seçim yapın</mat-option>
                  @for (contact of contacts(); track contact.id) {
                    <mat-option [value]="contact.id">{{ contact.firstName }} {{ contact.lastName }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="form-section">
            <h3 class="section-title">Finansal Bilgiler</h3>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Tutar</mat-label>
                <input matInput
                       type="number"
                       formControlName="amount"
                       placeholder="0">
                <mat-icon matPrefix>attach_money</mat-icon>
                @if (opportunityForm.get('amount')?.hasError('required') && opportunityForm.get('amount')?.touched) {
                  <mat-error>Tutar gereklidir</mat-error>
                }
                @if (opportunityForm.get('amount')?.hasError('min') && opportunityForm.get('amount')?.touched) {
                  <mat-error>Tutar 0'dan büyük olmalıdır</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Para Birimi</mat-label>
                <mat-select formControlName="currency">
                  <mat-option value="TRY">TRY (₺)</mat-option>
                  <mat-option value="USD">USD ($)</mat-option>
                  <mat-option value="EUR">EUR (€)</mat-option>
                </mat-select>
                <mat-icon matPrefix>monetization_on</mat-icon>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Beklenen Kapanış Tarihi</mat-label>
              <input matInput
                     [matDatepicker]="picker"
                     formControlName="expectedCloseDate"
                     readonly>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
          </div>

          <!-- Sales Information -->
          <div class="form-section">
            <h3 class="section-title">Satış Bilgileri</h3>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Opportunity Tipi</mat-label>
                <mat-select formControlName="opportunityTypeId">
                  @for (type of opportunityTypes(); track type.id) {
                    <mat-option [value]="type.id">{{ type.name }}</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>category</mat-icon>
                @if (opportunityForm.get('opportunityTypeId')?.hasError('required') && opportunityForm.get('opportunityTypeId')?.touched) {
                  <mat-error>Opportunity tipi gereklidir</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Satış Aşaması</mat-label>
                <mat-select formControlName="salesStageId">
                  @for (stage of salesStages(); track stage.id) {
                    <mat-option [value]="stage.id">{{ stage.name }} ({{ stage.probability }}%)</mat-option>
                  }
                </mat-select>
                <mat-icon matPrefix>timeline</mat-icon>
                @if (opportunityForm.get('salesStageId')?.hasError('required') && opportunityForm.get('salesStageId')?.touched) {
                  <mat-error>Satış aşaması gereklidir</mat-error>
                }
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Owner</mat-label>
              <mat-select formControlName="ownerUserId">
                @for (user of users(); track user.id) {
                  <mat-option [value]="user.id">{{ user.username }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix>person_outline</mat-icon>
            </mat-form-field>
          </div>

          <!-- Description -->
          <div class="form-section">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Açıklama</mat-label>
              <textarea matInput
                        formControlName="description"
                        rows="3"
                        placeholder="Opportunity hakkında detaylar..."></textarea>
              <mat-icon matPrefix>description</mat-icon>
            </mat-form-field>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">İptal</button>
        <button mat-raised-button
                color="primary"
                (click)="onSave()"
                [disabled]="opportunityForm.invalid || isSaving()"
                class="save-button">
          @if (isSaving()) {
            <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
            {{ isEdit ? 'Güncelleniyor...' : 'Oluşturuluyor...' }}
          } @else {
            <ng-container>
              <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
              {{ isEdit ? 'Güncelle' : 'Oluştur' }}
            </ng-container>
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .form-dialog {
      width: 100%;
      max-width: 700px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 24px 16px;
      border-bottom: 1px solid #e2e8f0;
    }

    .header-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #3b82f6;
    }

    .header-content h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
    }

    .header-content p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #64748b;
    }

    .dialog-content {
      padding: 20px 24px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .opportunity-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .half-width {
      flex: 1;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .save-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .button-spinner {
      margin-right: 8px;
    }

    /* Responsive */
    @media (max-width: 700px) {
      .form-dialog {
        max-width: 100%;
      }

      .form-row {
        flex-direction: column;
        gap: 12px;
      }

      .half-width {
        width: 100%;
      }
    }
  `]
})
export class OpportunityFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private opportunityService = inject(OpportunityService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<OpportunityFormDialogComponent>);

  // State
  isSaving = signal(false);
  accounts = signal<Account[]>([]);
  contacts = signal<Contact[]>([]);
  users = signal<UserDto[]>([]);
  salesStages = signal<SalesStage[]>([]);
  opportunityTypes = signal<OpportunityType[]>([]);

  // Props
  opportunity?: Opportunity;
  isEdit = false;

  // Form
  opportunityForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: OpportunityFormDialogData) {
    this.opportunity = data.opportunity;
    this.isEdit = data.isEdit || false;

    this.opportunityForm = this.fb.group({
      name: [this.opportunity?.name || '', Validators.required],
      accountId: [this.opportunity?.accountId || '', Validators.required],
      primaryContactId: [this.opportunity?.primaryContactId || ''],
      amount: [this.opportunity?.amount || null, [Validators.required, Validators.min(0)]],
      currency: [this.opportunity?.currency || 'TRY'],
      expectedCloseDate: [this.opportunity?.expectedCloseDate || null],
      opportunityTypeId: [this.opportunity?.opportunityTypeId || '', Validators.required],
      salesStageId: [this.opportunity?.salesStageId || '', Validators.required],
      ownerUserId: [this.opportunity?.ownerUserId || ''],
      description: [this.opportunity?.description || '']
    });
  }

  ngOnInit(): void {
    this.loadFormData();
  }

  private loadFormData(): void {
    // Load all reference data in parallel
    Promise.all([
      this.opportunityService.getAccounts().toPromise(),
      this.opportunityService.getContacts().toPromise(),
      this.opportunityService.getUsers().toPromise(),
      this.opportunityService.getSalesStages().toPromise(),
      this.opportunityService.getOpportunityTypes().toPromise()
    ]).then(([accounts, contacts, users, salesStages, opportunityTypes]) => {
      this.accounts.set(accounts || []);
      this.contacts.set(contacts || []);
      this.users.set(users || []);
      this.salesStages.set(salesStages || []);
      this.opportunityTypes.set(opportunityTypes || []);
    }).catch(error => {
      console.error('Error loading form data:', error);
      this.snackBar.open('Form verileri yüklenirken hata oluştu', 'Tamam', { duration: 3000 });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.opportunityForm.invalid) {
      this.opportunityForm.markAllAsTouched();
      return;
    }

    const formValue = this.opportunityForm.value;
    this.isSaving.set(true);

    if (this.isEdit && this.opportunity) {
      const updateData: OpportunityUpdateDto = {
        id: this.opportunity.id,
        name: formValue.name,
        accountId: formValue.accountId,
        primaryContactId: formValue.primaryContactId || undefined,
        amount: formValue.amount,
        currency: formValue.currency,
        expectedCloseDate: formValue.expectedCloseDate || undefined,
        opportunityTypeId: formValue.opportunityTypeId,
        salesStageId: formValue.salesStageId,
        ownerUserId: formValue.ownerUserId,
        description: formValue.description || undefined
      };

      this.opportunityService.updateOpportunity(updateData.id, updateData).subscribe({
        next: (response) => {
          this.snackBar.open('Opportunity başarıyla güncellendi!', 'Tamam', { duration: 3000 });
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error updating opportunity:', error);
          this.snackBar.open(
            error.message || 'Opportunity güncellenirken hata oluştu',
            'Tamam',
            { duration: 5000 }
          );
          this.isSaving.set(false);
        }
      });
    } else {
      const createData: OpportunityCreateDto = {
        name: formValue.name,
        accountId: formValue.accountId,
        primaryContactId: formValue.primaryContactId || undefined,
        amount: formValue.amount,
        currency: formValue.currency || 'TRY',
        expectedCloseDate: formValue.expectedCloseDate || undefined,
        opportunityTypeId: formValue.opportunityTypeId,
        salesStageId: formValue.salesStageId,
        ownerUserId: formValue.ownerUserId || undefined,
        description: formValue.description || undefined
      };

      this.opportunityService.createOpportunity(createData).subscribe({
        next: (response) => {
          this.snackBar.open('Opportunity başarıyla oluşturuldu!', 'Tamam', { duration: 3000 });
          this.dialogRef.close(response);
        },
        error: (error) => {
          console.error('Error creating opportunity:', error);
          this.snackBar.open(
            error.message || 'Opportunity oluşturulurken hata oluştu',
            'Tamam',
            { duration: 5000 }
          );
          this.isSaving.set(false);
        }
      });
    }
  }
}