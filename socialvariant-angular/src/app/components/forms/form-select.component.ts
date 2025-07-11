import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedUiModule } from '../../shared/shared-ui.module';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
  icon?: string;
}

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [
    SharedUiModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="form-select" [class.error]="hasError" [class.required]="required">
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
          
          <nz-select
            [id]="fieldId"
            [nzPlaceHolder]="placeholder || 'Please select'"
            [nzDisabled]="disabled"
            [nzMode]="mode"
            [nzAllowClear]="allowClear"
            [nzShowSearch]="showSearch"
            [nzServerSearch]="serverSearch"
            [nzLoading]="loading"
            [nzMaxTagCount]="maxTagCount || 0"
            [nzSize]="size"
            [formControl]="control"
            (nzOnSearch)="onSearch.emit($event)"
            (nzOpenChange)="onOpenChange.emit($event)"
            (nzBlur)="handleBlur()"
            (nzFocus)="handleFocus()"
            style="width: 100%">
            
            <!-- Regular Options -->
            <ng-container *ngIf="!groupedOptions">
              <nz-option 
                *ngFor="let option of options; trackBy: trackByOption"
                [nzLabel]="option.label"
                [nzValue]="option.value"
                [nzDisabled]="option.disabled"
                [nzCustomContent]="!!option.icon">
                <span *ngIf="option.icon">
                  <i nz-icon [nzType]="option.icon"></i>
                  {{ option.label }}
                </span>
              </nz-option>
            </ng-container>

            <!-- Grouped Options -->
            <ng-container *ngIf="groupedOptions">
              <nz-option-group 
                *ngFor="let group of groupedOptions; trackBy: trackByGroup"
                [nzLabel]="group.label">
                <nz-option 
                  *ngFor="let option of group.options; trackBy: trackByOption"
                  [nzLabel]="option.label"
                  [nzValue]="option.value"
                  [nzDisabled]="option.disabled"
                  [nzCustomContent]="!!option.icon">
                  <span *ngIf="option.icon">
                    <i nz-icon [nzType]="option.icon"></i>
                    {{ option.label }}
                  </span>
                </nz-option>
              </nz-option-group>
            </ng-container>
          </nz-select>
        </nz-form-control>
      </nz-form-item>
    </div>
  `,
  styles: [`
    .form-select {
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

    /* Select styling */
    ::ng-deep .ant-select {
      width: 100%;
      font-size: 14px;
    }

    ::ng-deep .ant-select-selector {
      border-radius: 6px !important;
      border: 1px solid #d9d9d9 !important;
      transition: all 0.3s;
      min-height: 32px;
      padding: 4px 11px;
    }

    ::ng-deep .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
      border-color: #40a9ff !important;
    }

    ::ng-deep .ant-select-focused .ant-select-selector,
    ::ng-deep .ant-select-selector:focus,
    ::ng-deep .ant-select-selector:active {
      border-color: #40a9ff !important;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
      border-right-width: 1px !important;
      outline: 0;
    }

    /* Error states */
    ::ng-deep .ant-form-item-has-error .ant-select-selector,
    ::ng-deep .ant-form-item-has-error .ant-select:not(.ant-select-disabled):hover .ant-select-selector {
      border-color: #ff4d4f !important;
    }

    ::ng-deep .ant-form-item-has-error .ant-select-focused .ant-select-selector {
      border-color: #ff4d4f !important;
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2) !important;
    }

    /* Success states */
    ::ng-deep .ant-form-item-has-success .ant-select-selector {
      border-color: #52c41a !important;
    }

    /* Disabled states */
    ::ng-deep .ant-select-disabled .ant-select-selector {
      background-color: #f5f5f5 !important;
      border-color: #d9d9d9 !important;
      color: rgba(0, 0, 0, 0.25) !important;
      cursor: not-allowed;
    }

    /* Selection text */
    ::ng-deep .ant-select-selection-item {
      color: rgba(0, 0, 0, 0.85);
      font-size: 14px;
      line-height: 1.5715;
    }

    ::ng-deep .ant-select-selection-placeholder {
      color: rgba(0, 0, 0, 0.25);
      font-size: 14px;
    }

    /* Arrow styling */
    ::ng-deep .ant-select-arrow {
      color: rgba(0, 0, 0, 0.25);
      font-size: 12px;
      margin-top: -6px;
      right: 11px;
    }

    ::ng-deep .ant-select-open .ant-select-arrow {
      transform: rotate(180deg);
    }

    /* Clear icon */
    ::ng-deep .ant-select-clear {
      background: #fff;
      color: rgba(0, 0, 0, 0.25);
      font-size: 12px;
      right: 32px;
      margin-top: -6px;
    }

    ::ng-deep .ant-select-clear:hover {
      color: rgba(0, 0, 0, 0.45);
    }

    /* Multiple selection tags */
    ::ng-deep .ant-select-multiple .ant-select-selection-item {
      background: #f5f5f5;
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      margin-right: 4px;
      margin-bottom: 2px;
      padding: 0 8px;
      height: 24px;
      line-height: 22px;
      font-size: 12px;
    }

    ::ng-deep .ant-select-multiple .ant-select-selection-item-remove {
      color: rgba(0, 0, 0, 0.45);
      font-size: 10px;
      margin-left: 4px;
    }

    ::ng-deep .ant-select-multiple .ant-select-selection-item-remove:hover {
      color: #ff4d4f;
    }

    /* Option groups */
    ::ng-deep .ant-select-item-group {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
      font-weight: 600;
      padding: 8px 12px 4px;
    }

    /* Options */
    ::ng-deep .ant-select-item-option {
      padding: 8px 12px;
      font-size: 14px;
      line-height: 1.5715;
      color: rgba(0, 0, 0, 0.85);
    }

    ::ng-deep .ant-select-item-option:hover {
      background-color: #f5f5f5;
    }

    ::ng-deep .ant-select-item-option-selected {
      background-color: #e6f7ff;
      color: #1890ff;
      font-weight: 600;
    }

    ::ng-deep .ant-select-item-option-active {
      background-color: #f5f5f5;
    }

    /* Loading state */
    ::ng-deep .ant-select-item-empty {
      padding: 16px 12px;
      text-align: center;
      color: rgba(0, 0, 0, 0.25);
      font-size: 14px;
    }

    /* Dropdown styling */
    ::ng-deep .ant-select-dropdown {
      border-radius: 6px;
      box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    }

    /* Search input in dropdown */
    ::ng-deep .ant-select-selection-search-input {
      height: 100% !important;
      font-size: 14px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .form-select {
        margin-bottom: 16px;
      }
      
      ::ng-deep .ant-form-item-label {
        padding-bottom: 4px;
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
      
      ::ng-deep .ant-select-selection-item {
        color: rgba(255, 255, 255, 0.85);
      }
    }
  `]
})
export class FormSelectComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() helpText?: string;
  @Input() required = false;
  @Input() disabled = false;
  @Input() options: SelectOption[] = [];
  @Input() groupedOptions?: { label: string; options: SelectOption[] }[];
  @Input() mode: 'default' | 'multiple' | 'tags' = 'default';
  @Input() allowClear = false;
  @Input() showSearch = false;
  @Input() serverSearch = false;
  @Input() loading = false;
  @Input() maxTagCount?: number;
  @Input() size: 'large' | 'default' | 'small' = 'default';
  @Input() fieldId?: string;

  @Output() valueChange = new EventEmitter<any>();
  @Output() onSearch = new EventEmitter<string>();
  @Output() onOpenChange = new EventEmitter<boolean>();
  @Output() blur = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();

  public control = new FormControl();
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor() {
    this.fieldId = this.fieldId || `select-${Math.random().toString(36).substr(2, 9)}`;
    
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

  handleBlur(): void {
    this.onTouched();
    this.blur.emit();
  }

  handleFocus(): void {
    this.focus.emit();
  }

  get hasError(): boolean {
    return this.control.invalid && (this.control.dirty || this.control.touched);
  }

  get errorMessage(): string {
    if (!this.hasError) return '';
    
    const errors = this.control.errors;
    if (!errors) return '';

    if (errors['required']) return `${this.label || 'This field'} is required`;
    return 'Invalid selection';
  }

  get validateStatus(): 'success' | 'warning' | 'error' | 'validating' | '' {
    if (this.control.pending) return 'validating';
    if (this.hasError) return 'error';
    if (this.control.valid && (this.control.dirty || this.control.touched)) return 'success';
    return '';
  }

  trackByOption(index: number, option: SelectOption): any {
    return option.value;
  }

  trackByGroup(index: number, group: any): any {
    return group.label;
  }
}
