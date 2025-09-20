import { Component, inject, signal, Inject } from '@angular/core';
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
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

import { Opportunity, OpportunityStageUpdateDto, SalesStage, OpportunityStageType } from '../../../core/models/opportunity.models.js';
import { OpportunityService } from '../../../core/services/opportunity.service.js';

export interface StageChangeDialogData {
  opportunity: Opportunity;
  availableStages: SalesStage[];
}

@Component({
  selector: 'app-stage-change-dialog',
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
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <div class="stage-dialog">
      <div mat-dialog-title class="dialog-header">
        <mat-icon class="header-icon">timeline</mat-icon>
        <div class="header-content">
          <h2>Satış Aşaması Değiştir</h2>
          <p>{{ opportunity.name }}</p>
        </div>
      </div>

      <mat-dialog-content class="dialog-content">
        <!-- Current Stage Info -->
        <mat-card class="current-stage-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>info</mat-icon>
            <mat-card-title>Mevcut Durum</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stage-info">
              <div class="info-item">
                <span class="label">Mevcut Aşama:</span>
                <mat-chip-set>
                  <mat-chip [color]="getStageColor(opportunity.stageType)" selected>
                    {{ opportunity.salesStageName }}
                  </mat-chip>
                </mat-chip-set>
              </div>
              <div class="info-item">
                <span class="label">Olasılık:</span>
                <span class="value">{{ opportunity.probability }}%</span>
              </div>
              <div class="info-item">
                <span class="label">Tutar:</span>
                <span class="value">{{ opportunity.amount | currency:'TRY':'symbol':'1.0-0' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Ağırlıklı Tutar:</span>
                <span class="value">{{ opportunity.weightedAmount | currency:'TRY':'symbol':'1.0-0' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <form [formGroup]="stageForm" class="stage-form">
          <!-- Stage Selection -->
          <div class="form-section">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Yeni Satış Aşaması</mat-label>
              <mat-select formControlName="salesStageId" (selectionChange)="onStageChange($event.value)">
                @for (stage of availableStages; track stage.id) {
                  <mat-option [value]="stage.id">
                    <div class="stage-option">
                      <span class="stage-name">{{ stage.name }}</span>
                      <span class="stage-probability">({{ stage.probability }}%)</span>
                      <mat-chip [color]="getStageColor(stage.stageType)" class="stage-chip">
                        {{ stage.stageType }}
                      </mat-chip>
                    </div>
                  </mat-option>
                }
              </mat-select>
              <mat-icon matPrefix>timeline</mat-icon>
              @if (stageForm.get('salesStageId')?.hasError('required') && stageForm.get('salesStageId')?.touched) {
                <mat-error>Yeni aşama seçimi gereklidir</mat-error>
              }
            </mat-form-field>

            <!-- Probability Override -->
            @if (selectedStage()) {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Olasılık (%)</mat-label>
                <input matInput
                       type="number"
                       formControlName="probability"
                       min="0"
                       max="100"
                       [placeholder]="selectedStage()!.probability.toString()">
                <mat-icon matPrefix>percent</mat-icon>
                <mat-hint>Varsayılan: {{ selectedStage()!.probability }}%</mat-hint>
              </mat-form-field>
            }
          </div>

          <!-- Win/Loss Reason (for Won/Lost stages) -->
          @if (isWonLostStage()) {
            <div class="form-section">
              <h3 class="section-title">
                {{ selectedStageType() === 'Won' ? 'Kazanma Nedeni' : 'Kaybetme Nedeni' }}
              </h3>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>{{ selectedStageType() === 'Won' ? 'Bu fırsatı nasıl kazandınız?' : 'Bu fırsatı neden kaybettiniz?' }}</mat-label>
                <textarea matInput
                          formControlName="reasonWonLost"
                          rows="4"
                          [placeholder]="selectedStageType() === 'Won' ? 'Kazanma nedenlerini açıklayın...' : 'Kaybetme nedenlerini açıklayın...'"></textarea>
                <mat-icon matPrefix>{{ selectedStageType() === 'Won' ? 'celebration' : 'info' }}</mat-icon>
                @if (stageForm.get('reasonWonLost')?.hasError('required') && stageForm.get('reasonWonLost')?.touched) {
                  <mat-error>{{ selectedStageType() === 'Won' ? 'Kazanma' : 'Kaybetme' }} nedeni gereklidir</mat-error>
                }
              </mat-form-field>

              <!-- Common Reasons -->
              @if (selectedStageType() === 'Won') {
                <div class="quick-reasons">
                  <p class="reasons-label">Hızlı seçenekler:</p>
                  <div class="reason-chips">
                    @for (reason of wonReasons; track reason) {
                      <mat-chip (click)="setReason(reason)" class="reason-chip">
                        {{ reason }}
                      </mat-chip>
                    }
                  </div>
                </div>
              } @else {
                <div class="quick-reasons">
                  <p class="reasons-label">Hızlı seçenekler:</p>
                  <div class="reason-chips">
                    @for (reason of lostReasons; track reason) {
                      <mat-chip (click)="setReason(reason)" class="reason-chip">
                        {{ reason }}
                      </mat-chip>
                    }
                  </div>
                </div>
              }
            </div>
          }

          <!-- Impact Preview -->
          @if (selectedStage()) {
            <mat-card class="impact-preview">
              <mat-card-header>
                <mat-icon mat-card-avatar>trending_up</mat-icon>
                <mat-card-title>Değişiklik Etkisi</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="impact-grid">
                  <div class="impact-item">
                    <span class="impact-label">Yeni Olasılık:</span>
                    <span class="impact-value">{{ getNewProbability() }}%</span>
                    <span class="impact-change" [class.positive]="getProbabilityChange() > 0" [class.negative]="getProbabilityChange() < 0">
                      {{ getProbabilityChange() > 0 ? '+' : '' }}{{ getProbabilityChange() }}%
                    </span>
                  </div>
                  <div class="impact-item">
                    <span class="impact-label">Yeni Ağırlıklı Tutar:</span>
                    <span class="impact-value">{{ getNewWeightedAmount() | currency:'TRY':'symbol':'1.0-0' }}</span>
                    <span class="impact-change" [class.positive]="getWeightedAmountChange() > 0" [class.negative]="getWeightedAmountChange() < 0">
                      {{ getWeightedAmountChange() > 0 ? '+' : '' }}{{ getWeightedAmountChange() | currency:'TRY':'symbol':'1.0-0' }}
                    </span>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </form>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">İptal</button>
        <button mat-raised-button
                [color]="getActionButtonColor()"
                (click)="onUpdateStage()"
                [disabled]="stageForm.invalid || isUpdating()"
                class="update-button">
          @if (isUpdating()) {
            <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
            Güncelleniyor...
          } @else {
            <ng-container>
              <mat-icon>{{ getActionIcon() }}</mat-icon>
              Aşamayı Güncelle
            </ng-container>
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .stage-dialog {
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
      max-height: 80vh;
      overflow-y: auto;
    }

    .current-stage-card {
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
    }

    .stage-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .label {
      font-weight: 500;
      color: #374151;
      min-width: 120px;
    }

    .value {
      font-weight: 600;
      color: #1e293b;
    }

    .stage-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
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

    .stage-option {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    .stage-name {
      flex: 1;
      font-weight: 500;
    }

    .stage-probability {
      color: #64748b;
      font-size: 14px;
    }

    .stage-chip {
      font-size: 11px !important;
      height: 20px !important;
      line-height: 20px !important;
    }

    .quick-reasons {
      margin-top: 12px;
    }

    .reasons-label {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #64748b;
    }

    .reason-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .reason-chip {
      cursor: pointer;
      transition: all 0.2s;
    }

    .reason-chip:hover {
      background-color: #e2e8f0;
    }

    .impact-preview {
      border: 1px solid #e2e8f0;
    }

    .impact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .impact-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .impact-label {
      font-size: 14px;
      color: #64748b;
    }

    .impact-value {
      font-weight: 600;
      color: #1e293b;
    }

    .impact-change {
      font-size: 12px;
      font-weight: 500;
    }

    .impact-change.positive {
      color: #059669;
    }

    .impact-change.negative {
      color: #dc2626;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .update-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .button-spinner {
      margin-right: 8px;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .stage-dialog {
        max-width: 100%;
      }

      .impact-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StageChangeDialogComponent {
  private fb = inject(FormBuilder);
  private opportunityService = inject(OpportunityService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<StageChangeDialogComponent>);

  // State
  isUpdating = signal(false);
  selectedStage = signal<SalesStage | null>(null);

  // Props
  opportunity: Opportunity;
  availableStages: SalesStage[];

  // Form
  stageForm: FormGroup;

  // Quick reasons
  wonReasons = [
    'Fiyat avantajı',
    'Teknik üstünlük',
    'İyi müşteri ilişkisi',
    'Hızlı teslimat',
    'Kapsamlı çözüm',
    'Referans başarısı'
  ];

  lostReasons = [
    'Fiyat çok yüksek',
    'Teknik gereksinimler karşılanmadı',
    'Rekabet kaybı',
    'Bütçe kısıtlaması',
    'Timing uygun değil',
    'Karar ertelendi'
  ];

  constructor(@Inject(MAT_DIALOG_DATA) public data: StageChangeDialogData) {
    this.opportunity = data.opportunity;
    this.availableStages = data.availableStages;

    this.stageForm = this.fb.group({
      salesStageId: ['', Validators.required],
      probability: [null],
      reasonWonLost: ['']
    });
  }

  onStageChange(stageId: number): void {
    const stage = this.availableStages.find(s => s.id === stageId);
    this.selectedStage.set(stage || null);

    if (stage) {
      // Update probability to stage default
      this.stageForm.patchValue({ probability: stage.probability });

      // Add validation for Won/Lost stages
      if (stage.stageType === 'Won' || stage.stageType === 'Lost') {
        this.stageForm.get('reasonWonLost')?.setValidators(Validators.required);
      } else {
        this.stageForm.get('reasonWonLost')?.clearValidators();
        this.stageForm.patchValue({ reasonWonLost: '' });
      }
      this.stageForm.get('reasonWonLost')?.updateValueAndValidity();
    }
  }

  selectedStageType(): OpportunityStageType | null {
    return this.selectedStage()?.stageType || null;
  }

  isWonLostStage(): boolean {
    const stageType = this.selectedStageType();
    return stageType === 'Won' || stageType === 'Lost';
  }

  setReason(reason: string): void {
    const currentReason = this.stageForm.get('reasonWonLost')?.value || '';
    const newReason = currentReason ? `${currentReason}, ${reason}` : reason;
    this.stageForm.patchValue({ reasonWonLost: newReason });
  }

  getNewProbability(): number {
    return this.stageForm.get('probability')?.value || this.selectedStage()?.probability || 0;
  }

  getProbabilityChange(): number {
    return this.getNewProbability() - this.opportunity.probability;
  }

  getNewWeightedAmount(): number {
    return this.opportunity.amount * (this.getNewProbability() / 100);
  }

  getWeightedAmountChange(): number {
    return this.getNewWeightedAmount() - this.opportunity.weightedAmount;
  }

  getStageColor(stageType: OpportunityStageType): 'primary' | 'accent' | 'warn' {
    switch (stageType) {
      case 'Won': return 'primary';
      case 'Lost': return 'warn';
      default: return 'accent';
    }
  }

  getActionButtonColor(): 'primary' | 'accent' | 'warn' {
    const stageType = this.selectedStageType();
    switch (stageType) {
      case 'Won': return 'primary';
      case 'Lost': return 'warn';
      default: return 'accent';
    }
  }

  getActionIcon(): string {
    const stageType = this.selectedStageType();
    switch (stageType) {
      case 'Won': return 'celebration';
      case 'Lost': return 'close';
      default: return 'timeline';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpdateStage(): void {
    if (this.stageForm.invalid) {
      this.stageForm.markAllAsTouched();
      return;
    }

    const formValue = this.stageForm.value;
    const updateData: OpportunityStageUpdateDto = {
      id: this.opportunity.id,
      salesStageId: formValue.salesStageId,
      probability: formValue.probability || undefined,
      reasonWonLost: formValue.reasonWonLost || undefined
    };

    this.isUpdating.set(true);

    this.opportunityService.updateOpportunityStage(updateData.id, updateData).subscribe({
      next: (response) => {
        const stageType = this.selectedStageType();
        let message = 'Opportunity aşaması başarıyla güncellendi!';

        if (stageType === 'Won') {
          message = '🎉 Tebrikler! Opportunity kazanıldı!';
        } else if (stageType === 'Lost') {
          message = 'Opportunity kaybedildi olarak işaretlendi.';
        }

        this.snackBar.open(message, 'Tamam', { duration: 4000 });
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Error updating opportunity stage:', error);
        this.snackBar.open(
          error.message || 'Aşama güncellenirken hata oluştu',
          'Tamam',
          { duration: 5000 }
        );
        this.isUpdating.set(false);
      }
    });
  }
}