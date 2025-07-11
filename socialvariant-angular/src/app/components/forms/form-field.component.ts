import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, AbstractControl } from '@angular/forms';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Removed SharedUiModule import; not needed for standalone component

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzIconModule,
    NzToolTipModule,
    NzInputModule,
    NzInputNumberModule,
    NzTagModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormFieldComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-field" [class.error]="hasError" [class.required]="required" [class.disabled]="disabled">
      <nz-form-item [nzGutter]="16">
        <nz-form-label 
          [nzRequired]="required" 
          [nzFor]="fieldId"
          [nzSpan]="24"
          *ngIf="label">
          <span class="form-label">{{ label }}</span>
          <i 
            nz-icon 
            nzType="question-circle" 
            nz-tooltip 
            [nzTooltipTitle]="helpText"
            class="help-icon"
            *ngIf="helpText">
          </i>
        </nz-form-label>
        <nz-form-control 
          [nzSpan]="24"
          [nzErrorTip]="errorMessage" 
          [nzValidateStatus]="validateStatus"
          [nzHasFeedback]="showFeedback">
          
          <!-- Text Input with Input Group -->
          <nz-input-group>
            <ng-template *ngIf="prefixIcon" nzPrefix>
              <i nz-icon [nzType]="prefixIcon" class="input-icon prefix-icon"></i>
            </ng-template>
            <input 
              *ngIf="type === 'text' || type === 'email' || type === 'password' || type === 'tel' || type === 'url'"
              nz-input
              [id]="fieldId"
              [type]="type"
              [placeholder]="placeholder"
              [disabled]="disabled"
              [readonly]="readonly"
              [maxlength]="maxLength || null"
              [formControl]="control"
              (blur)="handleBlur()"
              (focus)="handleFocus()">
            <ng-template *ngIf="suffixIcon" nzSuffix>
              <i nz-icon [nzType]="suffixIcon" class="input-icon suffix-icon"></i>
            </ng-template>
          </nz-input-group>

          <!-- Textarea -->
          <textarea 
            *ngIf="type === 'textarea'"
            nz-input
            [id]="fieldId"
            [placeholder]="placeholder"
            [disabled]="disabled"
            [readonly]="readonly"
            [rows]="rows"
            [maxlength]="maxLength || null"
            [formControl]="control"
            (blur)="handleBlur()"
            (focus)="handleFocus()">
          </textarea>

          <!-- Number Input -->
          <nz-input-number
            *ngIf="type === 'number'"
            [id]="fieldId"
            [nzPlaceHolder]="placeholder || ''"
            [nzDisabled]="disabled"
            [nzMin]="min"
            [nzMax]="max"
            [nzStep]="step"
            [nzPrecision]="precision || null"
            [nzSize]="'default'"
            [formControl]="control"
            (nzBlur)="handleBlur()"
            (nzFocus)="handleFocus()"
            style="width: 100%">
          </nz-input-number>

          <!-- Character Counter -->
          <div class="character-counter" *ngIf="maxLength && showCharacterCounter">
            <nz-tag 
              [nzColor]="isOverLimit ? 'error' : isNearLimit ? 'warning' : 'default'"
              class="counter-tag">
              {{ currentLength }}/{{ maxLength }}
            </nz-tag>
          </div>
        </nz-form-control>
      </nz-form-item>
    </div>
  `,
  styles: [`
    .form-field {
      margin-bottom: 24px;
      position: relative;
    }

    .form-label {
      font-weight: 600;
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
      line-height: 1.5715;
    }

    .help-icon {
      margin-left: 8px;
      color: rgba(0, 0, 0, 0.45);
      cursor: help;
      font-size: 14px;
      transition: color 0.3s;
    }

    .help-icon:hover {
      color: #1890ff;
    }

    .input-icon {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      transition: color 0.3s;
    }

    .prefix-icon {
      margin-right: 4px;
    }

    .suffix-icon {
      margin-left: 4px;
    }

    .character-counter {
      text-align: right;
      margin-top: 8px;
    }

    .counter-tag {
      font-size: 12px;
      border-radius: 4px;
    }

    /* Form item spacing */
    ::ng-deep .ant-form-item {
      margin-bottom: 0;
    }

    ::ng-deep .ant-form-item-label {
      padding-bottom: 8px;
    }

    ::ng-deep .ant-form-item-label > label {
      height: auto;
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
    }

    ::ng-deep .ant-form-item-required::before {
      color: #ff4d4f;
      font-size: 14px;
      margin-right: 4px;
    }

    /* Input styling */
    ::ng-deep .ant-input,
    ::ng-deep .ant-input-number {
      border-radius: 6px;
      border: 1px solid #d9d9d9;
      font-size: 14px;
      line-height: 1.5715;
      padding: 4px 11px;
      transition: all 0.3s;
    }

    ::ng-deep .ant-input:hover,
    ::ng-deep .ant-input-number:hover {
      border-color: #40a9ff;
      border-right-width: 1px;
    }

    ::ng-deep .ant-input:focus,
    ::ng-deep .ant-input-focused,
    ::ng-deep .ant-input-number:focus,
    ::ng-deep .ant-input-number-focused {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      border-right-width: 1px;
      outline: 0;
    }

    /* Error states */
    ::ng-deep .ant-form-item-has-error .ant-input,
    ::ng-deep .ant-form-item-has-error .ant-input:hover,
    ::ng-deep .ant-form-item-has-error .ant-input-number,
    ::ng-deep .ant-form-item-has-error .ant-input-number:hover {
      border-color: #ff4d4f;
    }

    ::ng-deep .ant-form-item-has-error .ant-input:focus,
    ::ng-deep .ant-form-item-has-error .ant-input-focused,
    ::ng-deep .ant-form-item-has-error .ant-input-number:focus,
    ::ng-deep .ant-form-item-has-error .ant-input-number-focused {
      border-color: #ff4d4f;
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }

    /* Success states */
    ::ng-deep .ant-form-item-has-success .ant-input,
    ::ng-deep .ant-form-item-has-success .ant-input-number {
      border-color: #52c41a;
    }

    /* Disabled states */
    ::ng-deep .ant-input[disabled],
    ::ng-deep .ant-input-number[disabled] {
      background-color: #f5f5f5;
      border-color: #d9d9d9;
      color: rgba(0, 0, 0, 0.25);
      cursor: not-allowed;
    }

    /* Textarea specific */
    ::ng-deep .ant-input {
      resize: vertical;
      min-height: 32px;
    }

    /* Input group styling */
    ::ng-deep .ant-input-group .ant-input {
      border-radius: 0;
    }

    ::ng-deep .ant-input-group .ant-input:first-child {
      border-top-left-radius: 6px;
      border-bottom-left-radius: 6px;
    }

    ::ng-deep .ant-input-group .ant-input:last-child {
      border-top-right-radius: 6px;
      border-bottom-right-radius: 6px;
    }

    /* Input number specific */
    ::ng-deep .ant-input-number {
      width: 100% !important;
    }

    ::ng-deep .ant-input-number-handler-wrap {
      border-radius: 0 6px 6px 0;
    }

    /* Feedback icon */
    ::ng-deep .ant-form-item-has-feedback .ant-form-item-children-icon {
      color: #1890ff;
      font-size: 16px;
    }

    ::ng-deep .ant-form-item-has-error .ant-form-item-children-icon {
      color: #ff4d4f;
    }

    ::ng-deep .ant-form-item-has-success .ant-form-item-children-icon {
      color: #52c41a;
    }

    /* Error message styling */
    ::ng-deep .ant-form-item-explain {
      font-size: 12px;
      line-height: 1.5715;
      color: #ff4d4f;
      margin-top: 4px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .form-field {
        margin-bottom: 16px;
      }
      
      ::ng-deep .ant-form-item-label {
        padding-bottom: 4px;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .form-label {
        color: rgba(255, 255, 255, 0.85);
      }
      
      .help-icon {
        color: rgba(255, 255, 255, 0.45);
      }
      
      .input-icon {
        color: rgba(255, 255, 255, 0.45);
      }
    }
  `]
})
export class FormFieldComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() helpText?: string;
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'url' | 'textarea' | 'number' = 'text';
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() maxLength?: number;
  @Input() minLength?: number;
  @Input() rows = 4;
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() showCharacterCounter = false;
  @Input() showFeedback = true;
  @Input() fieldId?: string;

  // Number input specific
  @Input() min?: number;
  @Input() max?: number;
  @Input() step = 1;
  @Input() precision?: number;

  // Validation
  @Input() customValidator?: (value: any) => string | null;
  @Input() asyncValidator?: (value: any) => Promise<string | null>;

  @Output() valueChange = new EventEmitter<any>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();

  public control = new FormControl();
  private destroy$ = new Subject<void>();
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    this.fieldId = this.fieldId || `field-${Math.random().toString(36).substr(2, 9)}`;
  }

  ngOnInit(): void {
    this.control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.onChange(value);
        this.valueChange.emit(value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleBlur(): void {
    this.onTouched();
    this.blur.emit();
  }

  handleFocus(): void {
    this.focus.emit();
  }

  // ControlValueAccessor
  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }

  get hasError(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }

  get errorMessage(): string {
    if (!this.hasError) return '';
    
    const errors = this.control.errors;
    if (!errors) return '';

    if (errors['required']) return `${this.label || 'This field'} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
    if (errors['min']) return `Value must be at least ${errors['min'].min}`;
    if (errors['max']) return `Value must be at most ${errors['max'].max}`;
    if (errors['pattern']) return 'Please enter a valid value';
    if (errors['custom']) return errors['custom'];

    return 'Invalid value';
  }

  get validateStatus(): 'success' | 'warning' | 'error' | 'validating' | '' {
    if (this.control.pending) return 'validating';
    if (this.hasError) return 'error';
    if (this.control.valid && (this.control.dirty || this.control.touched)) return 'success';
    return '';
  }

  get currentLength(): number {
    return this.control.value ? this.control.value.toString().length : 0;
  }

  get isNearLimit(): boolean {
    if (!this.maxLength) return false;
    return this.currentLength >= this.maxLength * 0.8;
  }

  get isOverLimit(): boolean {
    if (!this.maxLength) return false;
    return this.currentLength > this.maxLength;
  }
}
