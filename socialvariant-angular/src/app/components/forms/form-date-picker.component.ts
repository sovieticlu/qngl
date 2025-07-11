import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-form-date-picker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzDatePickerModule,
    NzFormModule,
    NzIconModule,
    NzToolTipModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormDatePickerComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-date-picker" [class.error]="hasError" [class.required]="required">
      <nz-form-item>
        <nz-form-label 
          [nzRequired]="required" 
          [nzFor]="fieldId"
          *ngIf="label">
          {{ label }}
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
          [nzErrorTip]="errorMessage" 
          [nzValidateStatus]="validateStatus">
          
          <!-- Single Date Picker -->
          <nz-date-picker
            *ngIf="mode === 'date'"
            [id]="fieldId"
            [nzPlaceHolder]="placeholder || 'Select date'"
            [nzDisabled]="disabled"
            [nzSize]="size"
            [nzFormat]="format || 'yyyy-MM-dd'"
            [nzAllowClear]="allowClear"
            [nzAutoFocus]="autoFocus"
            [nzDisabledDate]="disabledDate"
            [nzShowTime]="showTime"
            [nzShowToday]="showToday"
            [formControl]="control"
            (nzOnOpenChange)="onOpenChange.emit($event)"
            style="width: 100%">
          </nz-date-picker>

          <!-- Range Date Picker -->
          <nz-range-picker
            *ngIf="mode === 'range'"
            [id]="fieldId"
            [nzPlaceHolder]="rangePlaceholder"
            [nzDisabled]="disabled"
            [nzSize]="size"
            [nzFormat]="format || 'yyyy-MM-dd'"
            [nzAllowClear]="allowClear"
            [nzAutoFocus]="autoFocus"
            [nzDisabledDate]="disabledDate"
            [nzShowTime]="showTime"
            [formControl]="control"
            (nzOnOpenChange)="onOpenChange.emit($event)"
            style="width: 100%">
          </nz-range-picker>

          <!-- Month Picker -->
          <nz-month-picker
            *ngIf="mode === 'month'"
            [id]="fieldId"
            [nzPlaceHolder]="placeholder || 'Select month'"
            [nzDisabled]="disabled"
            [nzSize]="size"
            [nzFormat]="format || 'yyyy-MM'"
            [nzAllowClear]="allowClear"
            [nzAutoFocus]="autoFocus"
            [nzDisabledDate]="disabledDate"
            [formControl]="control"
            (nzOnOpenChange)="onOpenChange.emit($event)"
            style="width: 100%">
          </nz-month-picker>

          <!-- Year Picker -->
          <nz-year-picker
            *ngIf="mode === 'year'"
            [id]="fieldId"
            [nzPlaceHolder]="placeholder || 'Select year'"
            [nzDisabled]="disabled"
            [nzSize]="size"
            [nzFormat]="format || 'yyyy'"
            [nzAllowClear]="allowClear"
            [nzAutoFocus]="autoFocus"
            [nzDisabledDate]="disabledDate"
            [formControl]="control"
            (nzOnOpenChange)="onOpenChange.emit($event)"
            style="width: 100%">
          </nz-year-picker>

          <!-- Week Picker -->
          <nz-week-picker
            *ngIf="mode === 'week'"
            [id]="fieldId"
            [nzPlaceHolder]="placeholder || 'Select week'"
            [nzDisabled]="disabled"
            [nzSize]="size"
            [nzFormat]="format || 'yyyy-ww'"
            [nzAllowClear]="allowClear"
            [nzAutoFocus]="autoFocus"
            [nzDisabledDate]="disabledDate"
            [formControl]="control"
            (nzOnOpenChange)="onOpenChange.emit($event)"
            style="width: 100%">
          </nz-week-picker>

        </nz-form-control>
      </nz-form-item>
    </div>
  `,
  styles: [`
    .form-date-picker {
      margin-bottom: 24px;
      position: relative;
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

    /* Form item styling */
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
      font-size: 14px;
      line-height: 1.5715;
    }

    ::ng-deep .ant-form-item-required::before {
      color: #ff4d4f;
      font-size: 14px;
      margin-right: 4px;
    }

    /* Date picker styling */
    ::ng-deep .ant-picker {
      width: 100% !important;
      border-radius: 6px !important;
      border: 1px solid #d9d9d9 !important;
      font-size: 14px;
      line-height: 1.5715;
      padding: 4px 11px;
      transition: all 0.3s;
      min-height: 32px;
    }

    ::ng-deep .ant-picker:hover {
      border-color: #40a9ff !important;
      border-right-width: 1px !important;
    }

    ::ng-deep .ant-picker-focused,
    ::ng-deep .ant-picker:focus {
      border-color: #40a9ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
      border-right-width: 1px !important;
      outline: 0;
    }

    /* Error states */
    ::ng-deep .ant-form-item-has-error .ant-picker,
    ::ng-deep .ant-form-item-has-error .ant-picker:hover {
      border-color: #ff4d4f !important;
    }

    ::ng-deep .ant-form-item-has-error .ant-picker-focused,
    ::ng-deep .ant-form-item-has-error .ant-picker:focus {
      border-color: #ff4d4f !important;
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
    }

    /* Success states */
    ::ng-deep .ant-form-item-has-success .ant-picker {
      border-color: #52c41a !important;
    }

    /* Disabled states */
    ::ng-deep .ant-picker[disabled] {
      background-color: #f5f5f5 !important;
      border-color: #d9d9d9 !important;
      color: rgba(0, 0, 0, 0.25) !important;
      cursor: not-allowed;
    }

    /* Input text */
    ::ng-deep .ant-picker-input > input {
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
      border: none;
      outline: none;
      background: transparent;
    }

    ::ng-deep .ant-picker-input > input::placeholder {
      color: rgba(0, 0, 0, 0.25);
    }

    /* Suffix icon */
    ::ng-deep .ant-picker-suffix {
      color: rgba(0, 0, 0, 0.25);
      font-size: 14px;
    }

    /* Clear icon */
    ::ng-deep .ant-picker-clear {
      background: #fff;
      color: rgba(0, 0, 0, 0.25);
      font-size: 12px;
      right: 24px;
    }

    ::ng-deep .ant-picker-clear:hover {
      color: rgba(0, 0, 0, 0.45);
    }

    /* Range picker specific */
    ::ng-deep .ant-picker-range {
      padding: 4px 11px;
    }

    ::ng-deep .ant-picker-range-separator {
      color: rgba(0, 0, 0, 0.25);
      font-size: 14px;
    }

    ::ng-deep .ant-picker-range .ant-picker-input {
      text-align: center;
    }

    /* Active bar for range */
    ::ng-deep .ant-picker-active-bar {
      background: #1890ff;
      border-radius: 6px;
      transition: all 0.3s;
    }

    /* Dropdown panel */
    ::ng-deep .ant-picker-dropdown {
      border-radius: 6px;
      box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    }

    /* Panel header */
    ::ng-deep .ant-picker-header {
      border-bottom: 1px solid #f0f0f0;
      padding: 8px 12px;
    }

    ::ng-deep .ant-picker-header-view button {
      color: rgba(0, 0, 0, 0.85);
      font-weight: 600;
      font-size: 14px;
    }

    ::ng-deep .ant-picker-header-view button:hover {
      color: #1890ff;
    }

    /* Navigation buttons */
    ::ng-deep .ant-picker-header-super-prev-btn,
    ::ng-deep .ant-picker-header-prev-btn,
    ::ng-deep .ant-picker-header-next-btn,
    ::ng-deep .ant-picker-header-super-next-btn {
      color: rgba(0, 0, 0, 0.25);
      font-size: 14px;
      transition: color 0.3s;
    }

    ::ng-deep .ant-picker-header-super-prev-btn:hover,
    ::ng-deep .ant-picker-header-prev-btn:hover,
    ::ng-deep .ant-picker-header-next-btn:hover,
    ::ng-deep .ant-picker-header-super-next-btn:hover {
      color: #1890ff;
    }

    /* Calendar cells */
    ::ng-deep .ant-picker-cell {
      color: rgba(0, 0, 0, 0.85);
      border-radius: 4px;
      transition: all 0.3s;
    }

    ::ng-deep .ant-picker-cell:hover:not(.ant-picker-cell-disabled) {
      background: #f5f5f5;
    }

    ::ng-deep .ant-picker-cell-selected {
      background: #1890ff !important;
      color: #fff !important;
    }

    ::ng-deep .ant-picker-cell-today {
      border: 1px solid #1890ff;
      color: #1890ff;
    }

    ::ng-deep .ant-picker-cell-disabled {
      color: rgba(0, 0, 0, 0.25);
      background: transparent;
      cursor: not-allowed;
    }

    /* Range selection */
    ::ng-deep .ant-picker-cell-in-range {
      background: #e6f7ff;
      position: relative;
    }

    ::ng-deep .ant-picker-cell-range-start,
    ::ng-deep .ant-picker-cell-range-end {
      background: #1890ff !important;
      color: #fff !important;
    }

    /* Time panel */
    ::ng-deep .ant-picker-time-panel {
      border-left: 1px solid #f0f0f0;
    }

    ::ng-deep .ant-picker-time-panel-column {
      text-align: center;
    }

    ::ng-deep .ant-picker-time-panel-cell {
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
      padding: 4px 0;
    }

    ::ng-deep .ant-picker-time-panel-cell:hover {
      background: #f5f5f5;
    }

    ::ng-deep .ant-picker-time-panel-cell-selected {
      background: #1890ff;
      color: #fff;
    }

    /* Footer */
    ::ng-deep .ant-picker-footer {
      border-top: 1px solid #f0f0f0;
      padding: 8px 12px;
    }

    ::ng-deep .ant-picker-now-btn {
      color: #1890ff;
      font-size: 14px;
    }

    ::ng-deep .ant-picker-today-btn:hover,
    ::ng-deep .ant-picker-now-btn:hover {
      color: #40a9ff;
    }

    /* Size variations */
    ::ng-deep .ant-picker-large {
      font-size: 16px;
      min-height: 40px;
      padding: 6px 11px;
    }

    ::ng-deep .ant-picker-small {
      font-size: 12px;
      min-height: 24px;
      padding: 0 7px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .form-date-picker {
        margin-bottom: 16px;
      }
      
      ::ng-deep .ant-form-item-label {
        padding-bottom: 4px;
      }
      
      ::ng-deep .ant-picker-dropdown {
        max-width: 90vw;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .help-icon {
        color: rgba(255, 255, 255, 0.45);
      }
      
      ::ng-deep .ant-form-item-label > label {
        color: rgba(255, 255, 255, 0.85);
      }
      
      ::ng-deep .ant-picker-input > input {
        color: rgba(255, 255, 255, 0.85);
      }
    }
  `]
})
export class FormDatePickerComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() rangePlaceholder: [string, string] = ['Start date', 'End date'];
  @Input() helpText?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() mode: 'date' | 'range' | 'month' | 'year' | 'week' = 'date';
  @Input() format?: string;
  @Input() allowClear = true;
  @Input() autoFocus = false;
  @Input() showTime = false;
  @Input() showToday = true;
  @Input() size: 'large' | 'default' | 'small' = 'default';
  @Input() disabledDate?: (current: Date) => boolean;
  @Input() fieldId?: string;

  @Output() valueChange = new EventEmitter<any>();
  @Output() onOpenChange = new EventEmitter<boolean>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();

  public control = new FormControl();
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    this.fieldId = this.fieldId || `date-picker-${Math.random().toString(36).substr(2, 9)}`;
    
    this.control.valueChanges.subscribe(value => {
      this.onChange(value);
      this.valueChange.emit(value);
    });
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
    if (errors['invalidDate']) return 'Please select a valid date';
    return 'Invalid date';
  }

  get validateStatus(): 'success' | 'warning' | 'error' | 'validating' | '' {
    if (this.control.pending) return 'validating';
    if (this.hasError) return 'error';
    if (this.control.valid && (this.control.dirty || this.control.touched)) return 'success';
    return '';
  }
}
