// import { 
//   Component, 
//   Input, 
//   Output, 
//   EventEmitter, 
//   TemplateRef, 
//   ContentChild, 
//   ViewChild,
//   OnInit, 
//   OnDestroy,
//   ChangeDetectorRef,
//   forwardRef,
//   OnChanges,
//   SimpleChanges
// } from '@angular/core';
// import { 
//   FormGroup, 
//   FormBuilder, 
//   AbstractControl, 
//   ValidationErrors,
//   ControlValueAccessor,
//   NG_VALUE_ACCESSOR
// } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';
// import { Subject, Observable, BehaviorSubject, combineLatest } from 'rxjs';
// import { takeUntil, debounceTime, distinctUntilChanged, map, startWith } from 'rxjs/operators';
// import { NzButtonModule } from 'ng-zorro-antd/button';
// import { NzCardModule } from 'ng-zorro-antd/card';
// import { NzSpinModule } from 'ng-zorro-antd/spin';
// import { NzAlertModule } from 'ng-zorro-antd/alert';
// import { NzDividerModule } from 'ng-zorro-antd/divider';
// import { NzModalModule } from 'ng-zorro-antd/modal';
// import { NzIconModule } from 'ng-zorro-antd/icon';
// import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

// export interface FormState {
//   isDirty: boolean;
//   isValid: boolean;
//   isPending: boolean;
//   isSubmitting: boolean;
//   errors: ValidationErrors | null;
//   touchedFields: string[];
//   changedFields: string[];
// }

// export interface FormSubmitEvent<T = any> {
//   value: T;
//   originalValue: T;
//   changedFields: string[];
//   formState: FormState;
// }

// export interface FormResetEvent {
//   resetType: 'soft' | 'hard' | 'partial';
//   fieldsToReset?: string[];
// }

// export interface FormValidationRule {
//   field: string;
//   validator: (value: any, form: FormGroup) => ValidationErrors | null;
//   trigger?: 'change' | 'blur' | 'submit';
//   debounceTime?: number;
// }

// export interface FormAutoSaveConfig {
//   enabled: boolean;
//   debounceTime?: number;
//   saveFields?: string[];
//   excludeFields?: string[];
// }

// @Component({
//   selector: 'app-reusable-form',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     NzButtonModule,
//     NzCardModule,
//     NzSpinModule,
//     NzAlertModule,
//     NzDividerModule,
//     NzModalModule,
//     NzIconModule,
//     NzToolTipModule
//   ],
//   providers: [
//     {
//       provide: NG_VALUE_ACCESSOR,
//       useExisting: forwardRef(() => ReusableFormComponent),
//       multi: true
//     }
//   ],
//   template: `
//     <div class="reusable-form" [class.loading]="formState.isSubmitting">
//       <!-- Form Header -->
//       <div class="form-header" *ngIf="showHeader">
//         <div class="form-title">
//           <h3 *ngIf="title">{{ title }}</h3>
//           <p *ngIf="description" class="form-description">{{ description }}</p>
//         </div>
//         <div class="form-actions-header" *ngIf="showHeaderActions">
//           <button 
//             nz-button 
//             nzType="text" 
//             nzSize="small"
//             (click)="toggleFormHelp()"
//             nz-tooltip="Toggle help"
//             *ngIf="helpTemplate">
//             <i nz-icon nzType="question-circle"></i>
//           </button>
//           <button 
//             nz-button 
//             nzType="text" 
//             nzSize="small"
//             (click)="toggleAdvancedMode()"
//             nz-tooltip="Toggle advanced mode"
//             *ngIf="hasAdvancedMode">
//             <i nz-icon [nzType]="isAdvancedMode ? 'eye-invisible' : 'eye'"></i>
//           </button>
//         </div>
//       </div>

//       <!-- Form Help -->
//       <nz-alert 
//         *ngIf="showHelp && helpTemplate"
//         nzType="info"
//         nzShowIcon
//         nzCloseable
//         (nzOnClose)="showHelp = false"
//         class="form-help">
//         <ng-container *ngTemplateOutlet="helpTemplate"></ng-container>
//       </nz-alert>

//       <!-- Form Content -->
//       <div class="form-content" [class.advanced-mode]="isAdvancedMode">
//         <nz-spin [nzSpinning]="formState.isSubmitting" [nzTip]="loadingMessage">
//           <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
//             <!-- Main Form Fields -->
//             <div class="form-fields">
//               <ng-content select="[slot=fields]"></ng-content>
//               <ng-container *ngTemplateOutlet="fieldsTemplate"></ng-container>
//             </div>

//             <!-- Advanced Fields (conditionally shown) -->
//             <div class="advanced-fields" *ngIf="isAdvancedMode && (advancedFieldsTemplate || hasAdvancedContent)">
//               <nz-divider nzText="Advanced Options" nzOrientation="left"></nz-divider>
//               <ng-content select="[slot=advanced]"></ng-content>
//               <ng-container *ngTemplateOutlet="advancedFieldsTemplate"></ng-container>
//             </div>

//             <!-- Form Sections (for complex forms) -->
//             <div class="form-sections" *ngIf="sections && sections.length > 0">
//               <div class="form-section" *ngFor="let section of sections; trackBy: trackBySection">
//                 <nz-divider [nzText]="section.title" nzOrientation="left"></nz-divider>
//                 <div class="section-content">
//                   <ng-container *ngTemplateOutlet="section.template; context: { $implicit: section, form: form }"></ng-container>
//                 </div>
//               </div>
//             </div>

//             <!-- Custom Content -->
//             <div class="custom-content">
//               <ng-content></ng-content>
//             </div>
//           </form>
//         </nz-spin>
//       </div>

//       <!-- Form Errors -->
//       <div class="form-errors" *ngIf="hasFormErrors">
//         <nz-alert 
//           nzType="error" 
//           nzShowIcon 
//           [nzMessage]="getFormErrorMessage()"
//           [nzDescription]="getFormErrorDetails()"
//           *ngIf="showFormErrors">
//         </nz-alert>
//       </div>

//       <!-- Auto-save Indicator -->
//       <div class="auto-save-indicator" *ngIf="autoSaveConfig.enabled && lastAutoSaveTime">
//         <small class="text-muted">
//           <i nz-icon nzType="cloud" nzTheme="outline"></i>
//           Last saved: {{ lastAutoSaveTime | date:'short' }}
//         </small>
//       </div>

//       <!-- Conditional Footer -->
//       <div class="form-footer" *ngIf="showFooter && (formState.isDirty || alwaysShowFooter)">
//         <div class="footer-info">
//           <div class="change-indicator" *ngIf="formState.isDirty && showChangeInfo">
//             <small class="text-info">
//               <i nz-icon nzType="edit" nzTheme="outline"></i>
//               {{ formState.changedFields.length }} field(s) modified
//             </small>
//           </div>
//           <div class="validation-summary" *ngIf="!formState.isValid && form.touched">
//             <small class="text-warning">
//               <i nz-icon nzType="exclamation-circle" nzTheme="outline"></i>
//               Please fix {{ getErrorCount() }} error(s)
//             </small>
//           </div>
//         </div>
        
//         <div class="footer-actions">
//           <!-- Custom Footer Actions -->
//           <ng-content select="[slot=footer-start]"></ng-content>
          
//           <!-- Reset Button -->
//           <button 
//             nz-button 
//             type="button"
//             [disabled]="!formState.isDirty || formState.isSubmitting"
//             (click)="showResetConfirmation()"
//             *ngIf="showResetButton">
//             <i nz-icon nzType="reload" nzTheme="outline"></i>
//             {{ resetButtonText }}
//           </button>

//           <!-- Cancel Button -->
//           <button 
//             nz-button 
//             type="button"
//             [disabled]="formState.isSubmitting"
//             (click)="onCancel()"
//             *ngIf="showCancelButton">
//             {{ cancelButtonText }}
//           </button>

//           <!-- Save Draft Button -->
//           <button 
//             nz-button 
//             type="button"
//             [disabled]="!formState.isDirty || formState.isSubmitting"
//             (click)="onSaveDraft()"
//             *ngIf="showSaveDraftButton">
//             <i nz-icon nzType="save" nzTheme="outline"></i>
//             {{ saveDraftButtonText }}
//           </button>

//           <!-- Submit Button -->
//           <button 
//             nz-button 
//             nzType="primary"
//             type="submit"
//             [disabled]="!canSubmit"
//             [nzLoading]="formState.isSubmitting"
//             *ngIf="showSubmitButton">
//             <i nz-icon [nzType]="submitIcon" nzTheme="outline" *ngIf="submitIcon && !formState.isSubmitting"></i>
//             {{ formState.isSubmitting ? loadingMessage : submitButtonText }}
//           </button>

//           <!-- Custom Footer Actions -->
//           <ng-content select="[slot=footer-end]"></ng-content>
//         </div>
//       </div>
//     </div>

//     <!-- Reset Confirmation Modal -->
//     <nz-modal
//       [(nzVisible)]="showResetModal"
//       nzTitle="Confirm Reset"
//       [nzOkText]="confirmResetText"
//       [nzCancelText]="cancelResetText"
//       (nzOnOk)="confirmReset()"
//       (nzOnCancel)="showResetModal = false"
//       nzOkType="primary">
//       <ng-container *nzModalContent>
//         <p>{{ resetConfirmationMessage }}</p>
//         <div *ngIf="formState.changedFields.length > 0">
//           <p><strong>Changed fields:</strong></p>
//           <ul>
//             <li *ngFor="let field of formState.changedFields">{{ getFieldDisplayName(field) }}</li>
//           </ul>
//         </div>
//       </ng-container>
//     </nz-modal>
//   `,
//   styles: [`
//     .reusable-form {
//       position: relative;
//       background: #ffffff;
//       border-radius: 8px;
//       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 6px rgba(0, 0, 0, 0.04);
//       border: 1px solid #f0f0f0;
//       overflow: hidden;
//       transition: box-shadow 0.3s ease;
//     }

//     .reusable-form:hover {
//       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
//     }

//     .form-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: flex-start;
//       margin-bottom: 0;
//       padding: 24px 24px 16px;
//       border-bottom: 1px solid #f0f0f0;
//       background: linear-gradient(to bottom, #fafafa, #ffffff);
//     }

//     .form-title h3 {
//       margin: 0;
//       font-size: 18px;
//       font-weight: 600;
//       color: rgba(0, 0, 0, 0.88);
//       line-height: 1.4;
//       letter-spacing: -0.01em;
//     }

//     .form-description {
//       margin: 6px 0 0 0;
//       color: rgba(0, 0, 0, 0.65);
//       font-size: 14px;
//       line-height: 1.6;
//       max-width: 600px;
//     }

//     .form-actions-header {
//       display: flex;
//       gap: 8px;
//       align-items: flex-start;
//       flex-shrink: 0;
//     }

//     .form-help {
//       margin: 16px 24px 24px;
//       padding: 16px 20px;
//       background: linear-gradient(135deg, #f6f8ff 0%, #f0f5ff 100%);
//       border: 1px solid #d6e4ff;
//       border-radius: 8px;
//       color: rgba(0, 0, 0, 0.75);
//       line-height: 1.6;
//       position: relative;
//       overflow: hidden;
//     }

//     .form-help::before {
//       content: '';
//       position: absolute;
//       top: 0;
//       left: 0;
//       width: 4px;
//       height: 100%;
//       background: #1890ff;
//     }

//     .form-content {
//       position: relative;
//       padding: 24px;
//       min-height: 200px;
//     }

//     .form-fields {
//       margin-bottom: 32px;
//     }

//     .advanced-fields {
//       background: linear-gradient(135deg, #fafafa 0%, #f8f9fa 100%);
//       padding: 24px;
//       border-radius: 8px;
//       margin-bottom: 24px;
//       border: 1px solid #f0f0f0;
//       transition: all 0.3s ease;
//       position: relative;
//     }

//     .advanced-fields::before {
//       content: '';
//       position: absolute;
//       top: 0;
//       left: 0;
//       right: 0;
//       height: 2px;
//       background: linear-gradient(90deg, #1890ff, #40a9ff);
//     }

//     .form-content.advanced-mode .advanced-fields {
//       background: transparent;
//       padding: 0;
//       border: none;
//       margin-bottom: 24px;
//     }

//     .form-content.advanced-mode .advanced-fields::before {
//       display: none;
//     }

//     .form-section {
//       margin-bottom: 32px;
//       padding: 20px;
//       background: #ffffff;
//       border-radius: 8px;
//       border: 1px solid #f0f0f0;
//       transition: all 0.3s ease;
//     }

//     .form-section:hover {
//       border-color: #d9d9d9;
//       box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
//     }

//     .form-section:last-child {
//       margin-bottom: 0;
//     }

//     .section-content {
//       margin-top: 16px;
//     }

//     .form-errors {
//       margin-bottom: 24px;
//     }

//     .auto-save-indicator {
//       text-align: right;
//       margin-bottom: 12px;
//       font-size: 12px;
//       color: rgba(0, 0, 0, 0.45);
//     }

//     .form-footer {
//       background: linear-gradient(to bottom, #fafafa, #f5f5f5);
//       padding: 20px 24px;
//       border-top: 1px solid #f0f0f0;
//       margin-top: 24px;
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       flex-wrap: wrap;
//       gap: 16px;
//       border-radius: 0 0 8px 8px;
//     }

//     .footer-info {
//       flex: 1;
//       min-width: 200px;
//     }

//     .footer-actions {
//       display: flex;
//       gap: 12px;
//       flex-wrap: wrap;
//       align-items: center;
//     }

//     .change-indicator,
//     .validation-summary {
//       margin-bottom: 6px;
//       font-size: 13px;
//       line-height: 1.5;
//     }

//     .change-indicator {
//       font-weight: 500;
//     }

//     .text-info {
//       color: #1890ff;
//     }

//     .text-warning {
//       color: #faad14;
//     }

//     .text-success {
//       color: #52c41a;
//     }

//     .text-error {
//       color: #ff4d4f;
//     }

//     .text-muted {
//       color: rgba(0, 0, 0, 0.45);
//     }

//     .loading {
//       pointer-events: none;
//       opacity: 0.8;
//     }

//     /* Loading overlay */
//     .ant-spin-container {
//       position: relative;
//     }

//     .ant-spin-nested-loading > div > .ant-spin {
//       position: absolute;
//       top: 0;
//       left: 0;
//       z-index: 4;
//       display: block;
//       width: 100%;
//       height: 100%;
//       max-height: 400px;
//     }

//     /* Button enhancements */
//     .ant-btn {
//       border-radius: 6px;
//       font-weight: 400;
//       transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
//       box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
//     }

//     .ant-btn-primary {
//       background-color: #1890ff;
//       border-color: #1890ff;
//       box-shadow: 0 2px 0 rgba(0, 0, 0, 0.045);
//     }

//     .ant-btn-primary:hover {
//       background-color: #40a9ff;
//       border-color: #40a9ff;
//       box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
//       transform: translateY(-1px);
//     }

//     .ant-btn-default:hover {
//       border-color: #40a9ff;
//       color: #40a9ff;
//       box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//       transform: translateY(-1px);
//     }

//     .ant-btn-danger:hover {
//       box-shadow: 0 4px 8px rgba(255, 77, 79, 0.3);
//       transform: translateY(-1px);
//     }

//     /* Alert enhancements */
//     .ant-alert {
//       border-radius: 6px;
//       border: 1px solid;
//       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
//     }

//     .ant-alert-info {
//       background-color: #f6f8ff;
//       border-color: #d6e4ff;
//     }

//     .ant-alert-success {
//       background-color: #f6ffed;
//       border-color: #b7eb8f;
//     }

//     .ant-alert-warning {
//       background-color: #fffbe6;
//       border-color: #ffe58f;
//     }

//     .ant-alert-error {
//       background-color: #fff2f0;
//       border-color: #ffccc7;
//     }

//     /* Card enhancements */
//     .ant-card {
//       border-radius: 8px;
//       border: 1px solid #f0f0f0;
//       box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
//     }

//     .ant-card-head {
//       border-bottom: 1px solid #f0f0f0;
//       background: linear-gradient(to bottom, #fafafa, #f5f5f5);
//     }

//     .ant-card-head-title {
//       font-weight: 600;
//       color: rgba(0, 0, 0, 0.85);
//     }

//     /* Divider enhancements */
//     .ant-divider {
//       border-color: #f0f0f0;
//       margin: 24px 0;
//     }

//     .ant-divider-with-text {
//       color: rgba(0, 0, 0, 0.65);
//       font-weight: 500;
//     }

//     /* Modal enhancements */
//     .ant-modal {
//       border-radius: 8px;
//       overflow: hidden;
//     }

//     .ant-modal-header {
//       background: linear-gradient(to bottom, #fafafa, #f5f5f5);
//       border-bottom: 1px solid #f0f0f0;
//       border-radius: 8px 8px 0 0;
//     }

//     .ant-modal-title {
//       font-weight: 600;
//       color: rgba(0, 0, 0, 0.85);
//     }

//     .ant-modal-footer {
//       border-top: 1px solid #f0f0f0;
//       background: #fafafa;
//       border-radius: 0 0 8px 8px;
//     }

//     /* Responsive adjustments */
//     @media (max-width: 768px) {
//       .reusable-form {
//         border-radius: 0;
//         box-shadow: none;
//       }

//       .form-header {
//         flex-direction: column;
//         gap: 16px;
//         padding: 16px 16px 0;
//       }

//       .form-content {
//         padding: 0 16px;
//       }

//       .form-footer {
//         flex-direction: column;
//         align-items: stretch;
//         padding: 16px;
//       }

//       .footer-actions {
//         justify-content: stretch;
//         width: 100%;
//       }

//       .footer-actions .ant-btn {
//         flex: 1;
//         min-width: auto;
//       }

//       .section-content {
//         padding-left: 12px;
//       }

//       .advanced-fields {
//         padding: 16px;
//         margin-bottom: 16px;
//       }

//       .form-fields {
//         margin-bottom: 16px;
//       }
//     }

//     @media (max-width: 480px) {
//       .form-header {
//         padding: 12px 12px 0;
//       }

//       .form-content {
//         padding: 0 12px;
//       }

//       .form-footer {
//         padding: 12px;
//       }

//       .footer-actions {
//         flex-direction: column;
//         gap: 8px;
//       }

//       .ant-btn {
//         width: 100%;
//       }
//     }
//   `]
// })
// export class ReusableFormComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
//   // Template References
//   @ContentChild('fields') fieldsTemplate?: TemplateRef<any>;
//   @ContentChild('advanced') advancedFieldsTemplate?: TemplateRef<any>;
//   @ContentChild('help') helpTemplate?: TemplateRef<any>;

//   // Input Properties
//   @Input() form!: FormGroup;
//   @Input() title?: string;
//   @Input() description?: string;
//   @Input() initialValue?: any;
//   @Input() resetType: 'soft' | 'hard' | 'partial' = 'soft';
//   @Input() validationRules: FormValidationRule[] = [];
//   @Input() autoSaveConfig: FormAutoSaveConfig = { enabled: false, debounceTime: 2000 };
//   @Input() sections?: FormSection[] = [];

//   // Display Configuration
//   @Input() showHeader = true;
//   @Input() showHeaderActions = true;
//   @Input() showFooter = true;
//   @Input() alwaysShowFooter = false;
//   @Input() showFormErrors = true;
//   @Input() showChangeInfo = true;
//   @Input() hasAdvancedMode = false;
//   @Input() hasAdvancedContent = false;

//   // Button Configuration
//   @Input() showSubmitButton = true;
//   @Input() showCancelButton = false;
//   @Input() showResetButton = true;
//   @Input() showSaveDraftButton = false;
//   @Input() submitButtonText = 'Save';
//   @Input() cancelButtonText = 'Cancel';
//   @Input() resetButtonText = 'Reset';
//   @Input() saveDraftButtonText = 'Save Draft';
//   @Input() submitIcon = 'check';
//   @Input() loadingMessage = 'Saving...';

//   // Reset Configuration
//   @Input() resetConfirmationMessage = 'Are you sure you want to reset all changes? This action cannot be undone.';
//   @Input() confirmResetText = 'Reset';
//   @Input() cancelResetText = 'Cancel';

//   // Validation Configuration
//   @Input() validateOnInit = false;
//   @Input() validateOnChange = true;
//   @Input() validateOnBlur = true;
//   @Input() submitOnlyWhenValid = true;
//   @Input() showInlineErrors = true;

//   // Output Events
//   @Output() formSubmit = new EventEmitter<FormSubmitEvent>();
//   @Output() formCancel = new EventEmitter<void>();
//   @Output() formReset = new EventEmitter<FormResetEvent>();
//   @Output() formStateChange = new EventEmitter<FormState>();
//   @Output() formAutoSave = new EventEmitter<any>();
//   @Output() formDraftSave = new EventEmitter<any>();
//   @Output() fieldChange = new EventEmitter<{field: string, value: any, previousValue: any}>();

//   // State
//   public formState: FormState = {
//     isDirty: false,
//     isValid: true,
//     isPending: false,
//     isSubmitting: false,
//     errors: null,
//     touchedFields: [],
//     changedFields: []
//   };

//   public isAdvancedMode = false;
//   public showHelp = false;
//   public showResetModal = false;
//   public lastAutoSaveTime?: Date;

//   private destroy$ = new Subject<void>();
//   private originalValue: any = {};
//   private autoSaveSubscription?: any;
//   private fieldDisplayNames: {[key: string]: string} = {};

//   // ControlValueAccessor
//   private onChange = (value: any) => {};
//   private onTouched = () => {};

//   constructor(
//     private fb: FormBuilder,
//     private cdr: ChangeDetectorRef
//   ) {}

//   ngOnInit(): void {
//     this.initializeForm();
//     this.setupFormWatching();
//     this.setupValidation();
//     this.setupAutoSave();

//     if (this.validateOnInit) {
//       this.validateForm();
//     }
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['initialValue'] && !changes['initialValue'].firstChange) {
//       this.resetForm('soft');
//     }
    
//     if (changes['autoSaveConfig']) {
//       this.setupAutoSave();
//     }
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//     if (this.autoSaveSubscription) {
//       this.autoSaveSubscription.unsubscribe();
//     }
//   }

//   // ControlValueAccessor Implementation
//   writeValue(value: any): void {
//     if (value && this.form) {
//       this.form.patchValue(value, { emitEvent: false });
//       this.originalValue = { ...value };
//     }
//   }

//   registerOnChange(fn: any): void {
//     this.onChange = fn;
//   }

//   registerOnTouched(fn: any): void {
//     this.onTouched = fn;
//   }

//   setDisabledState(isDisabled: boolean): void {
//     if (isDisabled) {
//       this.form.disable({ emitEvent: false });
//     } else {
//       this.form.enable({ emitEvent: false });
//     }
//   }

//   // Form Initialization
//   private initializeForm(): void {
//     // Don't create a new form if one is already provided via @Input
//     if (!this.form) {
//       console.warn('No form provided to ReusableFormComponent. Creating empty form.');
//       this.form = this.fb.group({});
//     }

//     // Always capture the original value from the current form state
//     this.originalValue = { ...this.form.value };

//     // If initialValue is provided and different from current form value, patch it
//     if (this.initialValue && JSON.stringify(this.initialValue) !== JSON.stringify(this.form.value)) {
//       this.originalValue = { ...this.initialValue };
//       this.form.patchValue(this.initialValue, { emitEvent: false });
//     }

//     this.updateFormState();
//   }

//   // Form Watching Setup
//   private setupFormWatching(): void {
//     // Watch for form value changes
//     this.form.valueChanges
//       .pipe(
//         takeUntil(this.destroy$),
//         debounceTime(100),
//         distinctUntilChanged()
//       )
//       .subscribe(value => {
//         this.updateFormState();
//         this.onChange(value);
//         this.detectChangedFields();
//       });

//     // Watch for form status changes
//     this.form.statusChanges
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(() => {
//         this.updateFormState();
//       });

//     // Watch individual field changes
//     Object.keys(this.form.controls).forEach(fieldName => {
//       const control = this.form.get(fieldName);
//       if (control) {
//         control.valueChanges
//           .pipe(
//             takeUntil(this.destroy$),
//             distinctUntilChanged()
//           )
//           .subscribe(value => {
//             const previousValue = this.originalValue[fieldName];
//             this.fieldChange.emit({
//               field: fieldName,
//               value,
//               previousValue
//             });
//           });
//       }
//     });
//   }

//   // Validation Setup
//   private setupValidation(): void {
//     this.validationRules.forEach(rule => {
//       const control = this.form.get(rule.field);
//       if (control) {
//         // Add custom validator
//         const existingValidators = control.validator;
//         control.setValidators([
//           ...(existingValidators ? [existingValidators] : []),
//           (ctrl: AbstractControl) => rule.validator(ctrl.value, this.form)
//         ]);

//         // Setup validation triggers
//         if (rule.trigger === 'change' || this.validateOnChange) {
//           control.valueChanges
//             .pipe(
//               takeUntil(this.destroy$),
//               debounceTime(rule.debounceTime || 300)
//             )
//             .subscribe(() => {
//               control.updateValueAndValidity({ emitEvent: false });
//             });
//         }

//         if (rule.trigger === 'blur' || this.validateOnBlur) {
//           // Note: blur events would need to be handled by individual form controls
//         }
//       }
//     });
//   }

//   // Auto-save Setup
//   private setupAutoSave(): void {
//     if (this.autoSaveSubscription) {
//       this.autoSaveSubscription.unsubscribe();
//     }

//     if (this.autoSaveConfig.enabled) {
//       this.autoSaveSubscription = this.form.valueChanges
//         .pipe(
//           takeUntil(this.destroy$),
//           debounceTime(this.autoSaveConfig.debounceTime || 2000),
//           distinctUntilChanged()
//         )
//         .subscribe(value => {
//           if (this.formState.isDirty && this.formState.isValid) {
//             this.performAutoSave(value);
//           }
//         });
//     }
//   }

//   // State Management
//   private updateFormState(): void {
//     const currentValue = this.form.value;
//     const isDirty = JSON.stringify(currentValue) !== JSON.stringify(this.originalValue);
    
//     this.formState = {
//       isDirty,
//       isValid: this.form.valid,
//       isPending: this.form.pending,
//       isSubmitting: this.formState.isSubmitting,
//       errors: this.form.errors,
//       touchedFields: this.getTouchedFields(),
//       changedFields: this.getChangedFields()
//     };

//     this.formStateChange.emit(this.formState);
//     this.cdr.detectChanges();
//   }

//   private detectChangedFields(): void {
//     const currentValue = this.form.value;
//     const changedFields: string[] = [];

//     Object.keys(currentValue).forEach(key => {
//       if (JSON.stringify(currentValue[key]) !== JSON.stringify(this.originalValue[key])) {
//         changedFields.push(key);
//       }
//     });

//     this.formState.changedFields = changedFields;
//   }

//   private getTouchedFields(): string[] {
//     const touchedFields: string[] = [];
//     Object.keys(this.form.controls).forEach(key => {
//       if (this.form.get(key)?.touched) {
//         touchedFields.push(key);
//       }
//     });
//     return touchedFields;
//   }

//   private getChangedFields(): string[] {
//     const currentValue = this.form.value;
//     const changedFields: string[] = [];

//     Object.keys(currentValue).forEach(key => {
//       if (JSON.stringify(currentValue[key]) !== JSON.stringify(this.originalValue[key])) {
//         changedFields.push(key);
//       }
//     });

//     return changedFields;
//   }

//   // Form Actions
//   onSubmit(): void {
//     if (this.form.invalid && this.submitOnlyWhenValid) {
//       this.form.markAllAsTouched();
//       return;
//     }

//     this.formState.isSubmitting = true;
//     this.updateFormState();

//     const submitEvent: FormSubmitEvent = {
//       value: this.form.value,
//       originalValue: this.originalValue,
//       changedFields: this.formState.changedFields,
//       formState: { ...this.formState }
//     };

//     this.formSubmit.emit(submitEvent);
//   }

//   onCancel(): void {
//     this.formCancel.emit();
//   }

//   onSaveDraft(): void {
//     if (this.formState.isDirty) {
//       this.formDraftSave.emit(this.form.value);
//     }
//   }

//   showResetConfirmation(): void {
//     if (this.formState.isDirty) {
//       this.showResetModal = true;
//     }
//   }

//   confirmReset(): void {
//     this.resetForm(this.resetType);
//     this.showResetModal = false;
//   }

//   resetForm(type: 'soft' | 'hard' | 'partial' = 'soft', fieldsToReset?: string[]): void {
//     switch (type) {
//       case 'soft':
//         this.form.patchValue(this.originalValue);
//         break;
//       case 'hard':
//         this.form.reset();
//         this.originalValue = {};
//         break;
//       case 'partial':
//         if (fieldsToReset) {
//           const resetValues: any = {};
//           fieldsToReset.forEach(field => {
//             resetValues[field] = this.originalValue[field];
//           });
//           this.form.patchValue(resetValues);
//         }
//         break;
//     }

//     this.form.markAsUntouched();
//     this.form.markAsPristine();
//     this.updateFormState();

//     this.formReset.emit({
//       resetType: type,
//       fieldsToReset
//     });
//   }

//   // Auto-save
//   private performAutoSave(value: any): void {
//     this.lastAutoSaveTime = new Date();
//     this.formAutoSave.emit(value);
//   }

//   // UI Actions
//   toggleFormHelp(): void {
//     this.showHelp = !this.showHelp;
//   }

//   toggleAdvancedMode(): void {
//     this.isAdvancedMode = !this.isAdvancedMode;
//   }

//   // Utility Methods
//   get canSubmit(): boolean {
//     return this.formState.isDirty && 
//            (this.formState.isValid || !this.submitOnlyWhenValid) && 
//            !this.formState.isSubmitting;
//   }

//   get hasFormErrors(): boolean {
//     return !this.formState.isValid && this.form.touched;
//   }

//   getFormErrorMessage(): string {
//     const errorCount = this.getErrorCount();
//     return `Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} before submitting.`;
//   }

//   getFormErrorDetails(): string {
//     const errors: string[] = [];
//     Object.keys(this.form.controls).forEach(key => {
//       const control = this.form.get(key);
//       if (control?.errors && control.touched) {
//         const fieldName = this.getFieldDisplayName(key);
//         errors.push(`${fieldName}: ${this.getControlErrorMessage(control)}`);
//       }
//     });
//     return errors.join('; ');
//   }

//   getErrorCount(): number {
//     let count = 0;
//     Object.keys(this.form.controls).forEach(key => {
//       const control = this.form.get(key);
//       if (control?.errors && control.touched) {
//         count++;
//       }
//     });
//     return count;
//   }

//   getFieldDisplayName(fieldName: string): string {
//     return this.fieldDisplayNames[fieldName] || 
//            fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
//   }

//   setFieldDisplayName(fieldName: string, displayName: string): void {
//     this.fieldDisplayNames[fieldName] = displayName;
//   }

//   private getControlErrorMessage(control: AbstractControl): string {
//     const errors = control.errors;
//     if (!errors) return '';

//     if (errors['required']) return 'This field is required';
//     if (errors['email']) return 'Please enter a valid email';
//     if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
//     if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;
//     if (errors['pattern']) return 'Please enter a valid value';
//     if (errors['min']) return `Value must be at least ${errors['min'].min}`;
//     if (errors['max']) return `Value must be at most ${errors['max'].max}`;

//     return 'Invalid value';
//   }

//   trackBySection(index: number, section: FormSection): any {
//     return section.id || index;
//   }

//   // Public API Methods
//   public markAsSubmitted(): void {
//     this.formState.isSubmitting = false;
//     this.updateFormState();
//   }

//   public setOriginalValue(value: any): void {
//     this.originalValue = { ...value };
//     this.updateFormState();
//   }

//   public addValidationRule(rule: FormValidationRule): void {
//     this.validationRules.push(rule);
//     this.setupValidation();
//   }

//   public removeValidationRule(fieldName: string): void {
//     this.validationRules = this.validationRules.filter(rule => rule.field !== fieldName);
//   }

//   public isFieldChanged(fieldName: string): boolean {
//     return this.formState.changedFields.includes(fieldName);
//   }

//   public getFieldError(fieldName: string): string | null {
//     const control = this.form.get(fieldName);
//     if (control?.errors && control.touched) {
//       return this.getControlErrorMessage(control);
//     }
//     return null;
//   }

//   public validateForm(): void {
//     // Trigger validation for all form controls
//     Object.keys(this.form.controls).forEach(key => {
//       const control = this.form.get(key);
//       if (control) {
//         control.markAsTouched();
//         control.updateValueAndValidity();
//       }
//     });
    
//     // Update form state after validation
//     this.updateFormState();
//   }
// }

// // Supporting Interfaces
// export interface FormSection {
//   id?: string;
//   title: string;
//   template: TemplateRef<any>;
//   visible?: boolean;
//   collapsible?: boolean;
//   collapsed?: boolean;
// }
