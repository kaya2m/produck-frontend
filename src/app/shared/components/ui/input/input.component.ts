import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'datetime-local' | 'time';
export type InputSize = 'small' | 'medium' | 'large';
export type InputVariant = 'outline' | 'fill';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <mat-form-field
      [appearance]="variant"
      [class]="'input-' + size"
      [class.input-error]="hasError"
      [class.input-disabled]="disabled">

      <mat-label *ngIf="label">{{ label }}</mat-label>

      <!-- Prefix Icon -->
      <mat-icon *ngIf="prefixIcon" matPrefix [class.clickable]="prefixIconClickable" (click)="onPrefixIconClick()">
        {{ prefixIcon }}
      </mat-icon>

      <!-- Main Input -->
      <input *ngIf="!multiline"
        matInput
        #inputElement
        [type]="inputType"
        [placeholder]="placeholder || ''"
        [readonly]="readonly"
        [required]="required"
        [maxlength]="maxLength || null"
        [min]="min"
        [max]="max"
        [step]="step"
        [value]="value"
        [formControl]="control"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
        (keydown)="onKeydown($event)"
        [attr.aria-describedby]="helpText ? 'help-text' : null">

      <!-- Textarea for multiline -->
      <textarea *ngIf="multiline"
        matInput
        #inputElement
        [placeholder]="placeholder || ''"
        [readonly]="readonly"
        [required]="required"
        [maxlength]="maxLength || null"
        [rows]="rows"
        [value]="value"
        [formControl]="control"
        (input)="onInput($event)"
        (blur)="onBlur()"
        (focus)="onFocus()"
        (keydown)="onKeydown($event)"
        [attr.aria-describedby]="helpText ? 'help-text' : null">
      </textarea>

      <!-- Suffix Icon -->
      <mat-icon *ngIf="suffixIcon" matSuffix [class.clickable]="suffixIconClickable" (click)="onSuffixIconClick()">
        {{ suffixIcon }}
      </mat-icon>

      <!-- Password Toggle -->
      <button *ngIf="type === 'password'"
              mat-icon-button
              matSuffix
              type="button"
              (click)="togglePasswordVisibility()"
              [matTooltip]="inputType === 'password' ? 'Show password' : 'Hide password'">
        <mat-icon>{{ inputType === 'password' ? 'visibility' : 'visibility_off' }}</mat-icon>
      </button>

      <!-- Clear Button -->
      <button *ngIf="clearable && value && !disabled && !readonly"
              mat-icon-button
              matSuffix
              type="button"
              (click)="clear()"
              matTooltip="Clear">
        <mat-icon>clear</mat-icon>
      </button>

      <!-- Loading Spinner -->
      <mat-spinner *ngIf="loading" matSuffix diameter="20"></mat-spinner>

      <!-- Hint Text -->
      <mat-hint *ngIf="hintText">{{ hintText }}</mat-hint>

      <!-- Error Messages -->
      <mat-error *ngIf="hasError && errorMessage">
        {{ errorMessage }}
      </mat-error>
    </mat-form-field>

    <!-- Help Text -->
    <div *ngIf="helpText" class="help-text" id="help-text">
      {{ helpText }}
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .mat-mdc-form-field {
      width: 100%;
    }

    .input-small .mat-mdc-form-field {
      font-size: 0.875rem;
    }

    .input-medium .mat-mdc-form-field {
      font-size: 1rem;
    }

    .input-large .mat-mdc-form-field {
      font-size: 1.125rem;
    }

    .input-error {
      --mdc-outlined-text-field-focus-outline-color: #dc2626;
      --mdc-outlined-text-field-hover-outline-color: #dc2626;
    }

    .input-disabled {
      opacity: 0.6;
    }

    .clickable {
      cursor: pointer;
      transition: color 0.2s;
    }

    .clickable:hover {
      color: var(--mdc-theme-primary);
    }

    .help-text {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 4px;
      line-height: 1.4;
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class InputComponent implements ControlValueAccessor, OnInit {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'medium';
  @Input() variant: InputVariant = 'outline';
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() prefixIconClickable = false;
  @Input() suffixIconClickable = false;
  @Input() clearable = false;
  @Input() loading = false;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() required = false;
  @Input() maxLength?: number;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() hintText?: string;
  @Input() helpText?: string;
  @Input() errorMessage?: string;
  @Input() value?: string | number | null = '';
  @Input() multiline = false;
  @Input() rows?: number = 3;

  @Output() valueChange = new EventEmitter<string>();
  @Output() prefixIconClick = new EventEmitter<void>();
  @Output() suffixIconClick = new EventEmitter<void>();
  @Output() inputFocus = new EventEmitter<FocusEvent>();
  @Output() inputBlur = new EventEmitter<FocusEvent>();
  @Output() keydown = new EventEmitter<KeyboardEvent>();

  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;

  control = new FormControl('');
  inputType: InputType = 'text';

  private onChange = (value: string) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.inputType = this.type;
  }

  get hasError(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.control.setValue(this.value, { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }

  // Event handlers
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
    this.inputBlur.emit();
  }

  onFocus(): void {
    this.inputFocus.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    this.keydown.emit(event);
  }

  onPrefixIconClick(): void {
    if (this.prefixIconClickable) {
      this.prefixIconClick.emit();
    }
  }

  onSuffixIconClick(): void {
    if (this.suffixIconClickable) {
      this.suffixIconClick.emit();
    }
  }

  togglePasswordVisibility(): void {
    this.inputType = this.inputType === 'password' ? 'text' : 'password';
  }

  clear(): void {
    this.value = '';
    this.control.setValue('');
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.inputElement.nativeElement.focus();
  }

  focus(): void {
    this.inputElement.nativeElement.focus();
  }

  blur(): void {
    this.inputElement.nativeElement.blur();
  }
}