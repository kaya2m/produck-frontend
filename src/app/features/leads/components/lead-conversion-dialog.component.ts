import { Component, inject, signal, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { Lead } from '../../../core/models/crm.models';
import { LeadService } from '../../../core/services/lead.service';

export interface LeadConversionDialogData {
  lead: Lead;
}

@Component({
  selector: 'app-lead-conversion-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="conversion-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon class="header-icon">transform</mat-icon>
        <div class="header-content">
          <h2>Lead Dönüştürme</h2>
          <p>{{ lead.firstName }} {{ lead.lastName }} - {{ lead.companyName }}</p>
        </div>
      </div>

      <mat-dialog-content class="dialog-content">
        <!-- Conversion Preview -->
        @if (conversionPreview()) {
          <mat-card class="preview-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>info</mat-icon>
              <mat-card-title>Dönüşüm Önizlemesi</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (conversionPreview()!.duplicateWarnings?.length) {
                <div class="warning-section">
                  <mat-icon class="warning-icon">warning</mat-icon>
                  <div class="warnings">
                    @for (warning of conversionPreview()!.duplicateWarnings; track warning) {
                      <p class="warning-text">{{ warning }}</p>
                    }
                  </div>
                </div>
              }

              <div class="preview-info">
                <div class="preview-item">
                  <mat-icon>{{ conversionPreview()!.accountExists ? 'check_circle' : 'add_circle' }}</mat-icon>
                  <span>Account: {{ conversionPreview()!.suggestedAccountName }}</span>
                </div>
                <div class="preview-item">
                  <mat-icon>{{ conversionPreview()!.contactExists ? 'check_circle' : 'add_circle' }}</mat-icon>
                  <span>Contact: {{ conversionPreview()!.suggestedContactName }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        }

        <form [formGroup]="conversionForm" class="conversion-form">
          <!-- Account Creation -->
          <mat-expansion-panel [expanded]="true" class="conversion-section">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-checkbox
                  formControlName="createAccount"
                  (click)="$event.stopPropagation()">
                  Account Oluştur
                </mat-checkbox>
              </mat-panel-title>
            </mat-expansion-panel-header>

            @if (conversionForm.get('createAccount')?.value) {
              <div class="form-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Account Adı</mat-label>
                  <input matInput formControlName="accountName" placeholder="Şirket adını girin">
                  <mat-icon matPrefix>business</mat-icon>
                </mat-form-field>
              </div>
            }
          </mat-expansion-panel>

          <!-- Contact Creation -->
          <mat-expansion-panel [expanded]="true" class="conversion-section">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-checkbox
                  formControlName="createContact"
                  (click)="$event.stopPropagation()">
                  Contact Oluştur
                </mat-checkbox>
              </mat-panel-title>
            </mat-expansion-panel-header>

            @if (conversionForm.get('createContact')?.value) {
              <div class="form-section">
                <p class="section-info">
                  Contact bilgileri Lead'den otomatik olarak alınacak.
                </p>
              </div>
            }
          </mat-expansion-panel>

          <!-- Opportunity Creation -->
          <mat-expansion-panel class="conversion-section">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-checkbox
                  formControlName="createOpportunity"
                  (click)="$event.stopPropagation()">
                  Opportunity Oluştur
                </mat-checkbox>
              </mat-panel-title>
            </mat-expansion-panel-header>

            @if (conversionForm.get('createOpportunity')?.value) {
              <div class="form-section">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Opportunity Adı</mat-label>
                  <input matInput formControlName="opportunityName" placeholder="Satış fırsatı adını girin">
                  <mat-icon matPrefix>star</mat-icon>
                </mat-form-field>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Tahmini Tutar (₺)</mat-label>
                    <input matInput
                           type="number"
                           formControlName="opportunityAmount"
                           placeholder="0">
                    <mat-icon matPrefix>attach_money</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Kapanış Tarihi</mat-label>
                    <input matInput
                           [matDatepicker]="picker"
                           formControlName="opportunityCloseDate"
                           readonly>
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>
                </div>
              </div>
            }
          </mat-expansion-panel>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">İptal</button>
        <button mat-raised-button
                color="primary"
                (click)="onConvert()"
                [disabled]="conversionForm.invalid || isConverting()"
                class="convert-button">
          @if (isConverting()) {
            <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
            Dönüştürülüyor...
          } @else {
            <ng-container>
              <mat-icon>transform</mat-icon>
              <span>Lead'i Dönüştür</span>
            </ng-container>
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .conversion-dialog {
      width: 100%;
      max-width: 600px;
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
      max-height: 70vh;
      overflow-y: auto;
    }

    .preview-card {
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
    }

    .warning-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: #fef3c7;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .warning-icon {
      color: #d97706;
      font-size: 20px;
      margin-top: 2px;
    }

    .warnings {
      flex: 1;
    }

    .warning-text {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: #92400e;
    }

    .preview-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #374151;
    }

    .preview-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .conversion-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .conversion-section {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .conversion-section .mat-expansion-panel-header {
      padding: 16px;
    }

    .form-section {
      padding: 16px;
    }

    .section-info {
      font-size: 14px;
      color: #64748b;
      margin: 0;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 6px;
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

    .convert-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .button-spinner {
      margin-right: 8px;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .conversion-dialog {
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
export class LeadConversionDialogComponent {
  private fb = inject(FormBuilder);
  private leadService = inject(LeadService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<LeadConversionDialogComponent>);

  lead: Lead;

  // State
  isConverting = signal(false);
  conversionPreview = signal<any>(null);

  // Form
  conversionForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: LeadConversionDialogData) {
    this.lead = data.lead;

    this.conversionForm = this.fb.group({
      createAccount: [true],
      accountName: [this.lead.companyName || `${this.lead.firstName} ${this.lead.lastName} Company`, Validators.required],
      createContact: [true],
      createOpportunity: [false],
      opportunityName: [''],
      opportunityAmount: [null],
      opportunityCloseDate: [null]
    });

    // Load conversion preview
    this.loadConversionPreview();

    // Update opportunity name when createOpportunity changes
    this.conversionForm.get('createOpportunity')?.valueChanges.subscribe(createOpp => {
      if (createOpp && !this.conversionForm.get('opportunityName')?.value) {
        const oppName = `${this.lead.companyName || this.lead.firstName + ' ' + this.lead.lastName} - Sales Opportunity`;
        this.conversionForm.patchValue({ opportunityName: oppName });
      }
    });
  }

  private loadConversionPreview(): void {
    this.leadService.getLeadConversionPreview(this.lead.id).subscribe({
      next: (response) => {
        this.conversionPreview.set(response.data || response);
      },
      error: (error) => {
        console.error('Error loading conversion preview:', error);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConvert(): void {
    if (this.conversionForm.invalid) {
      this.conversionForm.markAllAsTouched();
      return;
    }

    const formValue = this.conversionForm.value;

    const conversionData = {
      createAccount: formValue.createAccount,
      accountName: formValue.createAccount ? formValue.accountName : undefined,
      createContact: formValue.createContact,
      createOpportunity: formValue.createOpportunity,
      opportunityName: formValue.createOpportunity ? formValue.opportunityName : undefined,
      opportunityAmount: formValue.createOpportunity ? formValue.opportunityAmount : undefined,
      opportunityCloseDate: formValue.createOpportunity ? formValue.opportunityCloseDate : undefined
    };

    this.isConverting.set(true);

    this.leadService.convertLead(this.lead.id, conversionData).subscribe({
      next: (response) => {
        const result: any = (response as any).data || response;

        let successMessage = 'Lead başarıyla dönüştürüldü!';
        if (result.accountId && result.contactId && result.opportunityId) {
          successMessage = 'Account, Contact ve Opportunity oluşturuldu!';
        } else if (result.accountId && result.contactId) {
          successMessage = 'Account ve Contact oluşturuldu!';
        }

        this.snackBar.open(successMessage, 'Tamam', { duration: 4000 });
        this.dialogRef.close(result);
      },
      error: (error) => {
        console.error('Error converting lead:', error);
        this.snackBar.open(
          error.message || 'Lead dönüştürme sırasında hata oluştu',
          'Tamam',
          { duration: 5000 }
        );
        this.isConverting.set(false);
      }
    });
  }
}