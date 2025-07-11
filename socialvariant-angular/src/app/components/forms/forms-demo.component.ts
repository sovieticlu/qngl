import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl, FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface FormSubmitEvent<T = any> {
  value: T;
  originalValue: T;
  changedFields: string[];
}

export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  isPending: boolean;
  isSubmitting: boolean;
}

// Interface for select options
export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
  icon?: string;
}

// Import Ant Design modules
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';

// Import custom component
import { TextTransferComponent } from './text-transfer.component';

@Component({
  selector: 'app-forms-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // Pure Ant Design modules only
    NzCardModule,
    NzTabsModule,
    NzSwitchModule,
    NzCheckboxModule,
    NzRadioModule,
    NzButtonModule,
    NzAlertModule,
    NzDividerModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzDatePickerModule,
    NzIconModule,
    NzToolTipModule,
    NzGridModule,
    NzSpaceModule,
    NzTypographyModule,
    NzSpinModule,
    NzBadgeModule,
    NzTagModule,
    NzProgressModule,
    // Custom component
    TextTransferComponent
  ],
  template: `
    <div class="ant-layout-content" style="padding: 24px;">
      <nz-row [nzGutter]="[24, 24]">
        <nz-col nzSpan="24">
          <nz-space nzDirection="vertical" nzSize="large" style="width: 100%;">
            <!-- Page Header -->
            <nz-card>
              <nz-row [nzGutter]="[16, 16]" nzAlign="middle">
                <nz-col nzFlex="auto">
                  <nz-space nzDirection="vertical" nzSize="small">
                    <h1 nz-typography class="ant-typography-h2">
                      <i nz-icon nzType="form" class="ant-typography-text-primary"></i>
                      Advanced Reusable Forms Demo
                    </h1>
                    <p nz-typography class="ant-typography-text-secondary">
                      Comprehensive demonstration of responsive form layouts using Ant Design components and grid system
                    </p>
                  </nz-space>
                </nz-col>
                <nz-col nzFlex="none">
                  <nz-space>
                    <nz-badge [nzCount]="3" nzShowZero>
                      <nz-tag nzColor="blue">Forms Available</nz-tag>
                    </nz-badge>
                    <nz-tag nzColor="green">
                      <i nz-icon nzType="check-circle"></i>
                      Responsive
                    </nz-tag>
                  </nz-space>
                </nz-col>
              </nz-row>
            </nz-card>
            <!-- Main Form Container -->
            <nz-card>
              <!-- Custom Text Transfer Component Demo -->
             
              <nz-tabset nzType="card" nzSize="large" [nzTabBarGutter]="8">
                <!-- Simple Test Form -->
                <nz-tab nzTitle="Quick Test">
                  <ng-template nz-tab>
                    <nz-space nzAlign="center">
                      <i nz-icon nzType="experiment"></i>
                      <span>Quick Test</span>
                    </nz-space>
                
                  <nz-space nzDirection="vertical" nzSize="large" style="width: 100%;">
                    <nz-card nzTitle="Test Embedded Ant Design Components">
                      <ng-template #title>
                        <nz-space nzAlign="center">
                          <i nz-icon nzType="thunderbolt" class="ant-typography-text-warning"></i>
                          <span>Test Embedded Components</span>
                        </nz-space>
                      </ng-template>
                      <form nz-form [nzLayout]="'vertical'" [formGroup]="basicForm" (ngSubmit)="onSimpleTestSubmit()">
                        <nz-row [nzGutter]="[24, 16]">
                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="user"></i>
                                  <span>Full Name</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Please enter your full name" [nzValidateStatus]="fullNameControl.invalid && fullNameControl.touched ? 'error' : ''">
                                <input 
                                  nz-input 
                                  placeholder="Enter your full name" 
                                  formControlName="fullName"
                                  size="large">
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="mail"></i>
                                  <span>Email Address</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Please enter a valid email address" [nzValidateStatus]="emailControl.invalid && emailControl.touched ? 'error' : ''">
                                <nz-input-group nzPrefixIcon="mail" nzSize="large">
                                  <input 
                                    nz-input 
                                    type="email"
                                    placeholder="Enter your email" 
                                    formControlName="email">
                                </nz-input-group>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                          <nz-col nzSpan="24">
                            <nz-form-item>
                              <nz-form-control>
                                <nz-space>
                                  <button nz-button nzType="primary" nzSize="large" [nzLoading]="false" type="submit">
                                    <i nz-icon nzType="send"></i>
                                    Test Submit
                                  </button>
                                  <button nz-button nzType="default" nzSize="large" type="button" (click)="basicForm.reset()">
                                    <i nz-icon nzType="reload"></i>
                                    Reset
                                  </button>
                                </nz-space>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                        </nz-row>
                      </form>
                    </nz-card>
                  </nz-space>
                  </ng-template>
                </nz-tab>

                <!-- User Registration Form -->
                <nz-tab nzTitle="User Registration">
                  <ng-template nz-tab>
                    <nz-space nzAlign="center">
                      <i nz-icon nzType="user-add"></i>
                      <span>User Registration</span>
                    </nz-space>
              
                  
                  <nz-space nzDirection="vertical" nzSize="large" style="width: 100%;">
                    <nz-card nzTitle="User Registration Form">
                      <ng-template #title>
                        <nz-space nzAlign="center">
                          <i nz-icon nzType="user-add" class="ant-typography-text-primary"></i>
                          <span>User Registration Form</span>
                        </nz-space>
                      </ng-template>
                      
                      <p nz-typography class="ant-typography-text-secondary">
                        Create a new user account with comprehensive information
                      </p>
                      
                      <form nz-form [nzLayout]="'vertical'" [formGroup]="basicForm" (ngSubmit)="onBasicFormSubmit()">
                        <nz-row [nzGutter]="[24, 16]">
                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="user"></i>
                                  <span>Full Name</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Please enter your full name" [nzValidateStatus]="fullNameControl.invalid && fullNameControl.touched ? 'error' : ''">
                                <input 
                                  nz-input 
                                  placeholder="Enter your full name" 
                                  formControlName="fullName"
                                  size="large"
                                  nz-tooltip
                                  nzTooltipTitle="Your first and last name">
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>

                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="mail"></i>
                                  <span>Email Address</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Please enter a valid email address" [nzValidateStatus]="emailControl.invalid && emailControl.touched ? 'error' : ''">
                                <nz-input-group nzPrefixIcon="mail" nzSize="large">
                                  <input 
                                    nz-input 
                                    type="email"
                                    placeholder="Enter your email" 
                                    formControlName="email"
                                    nz-tooltip
                                    nzTooltipTitle="We'll use this for account verification">
                                </nz-input-group>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>

                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label>
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="phone"></i>
                                  <span>Phone Number</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control [nzValidateStatus]="phoneControl.invalid && phoneControl.touched ? 'error' : ''">
                                <nz-input-group nzPrefixIcon="phone" nzSize="large">
                                  <input 
                                    nz-input 
                                    type="tel"
                                    placeholder="Enter your phone number" 
                                    formControlName="phone">
                                </nz-input-group>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>

                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="global"></i>
                                  <span>Country</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Please select your country" [nzValidateStatus]="countryControl.invalid && countryControl.touched ? 'error' : ''">
                                <nz-select 
                                  nzPlaceHolder="Select your country" 
                                  nzShowSearch
                                  nzSize="large"
                                  formControlName="country">
                                  <nz-option 
                                    *ngFor="let option of countryOptions" 
                                    [nzValue]="option.value" 
                                    [nzLabel]="option.label">
                                    <nz-space nzAlign="center" nzSize="small">
                                      <i nz-icon [nzType]="option.icon || 'flag'"></i>
                                      <span>{{ option.label }}</span>
                                    </nz-space>
                                  </nz-option>
                                </nz-select>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                          
                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label>
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="calendar"></i>
                                  <span>Date of Birth</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control [nzValidateStatus]="dateOfBirthControl.invalid && dateOfBirthControl.touched ? 'error' : ''">
                                <nz-date-picker 
                                  nzPlaceHolder="Select your birth date"
                                  [nzDisabledDate]="disableFutureDates"
                                  formControlName="dateOfBirth"
                                  nzSize="large"
                                  style="width: 100%">
                                </nz-date-picker>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>

                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label>
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="file-text"></i>
                                  <span>Bio</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control [nzValidateStatus]="bioControl.invalid && bioControl.touched ? 'error' : ''">
                                <textarea 
                                  nz-input 
                                  placeholder="Tell us about yourself"
                                  [nzAutosize]="{ minRows: 4, maxRows: 6 }"
                                  [maxlength]="500"
                                  formControlName="bio">
                                </textarea>
                                <div class="ant-form-item-explain ant-form-item-explain-connected">
                                  <div class="ant-form-item-explain-error">
                                    <small class="ant-typography-caption">
                                      {{ basicForm.get('bio')?.value?.length || 0 }}/500 characters
                                    </small>
                                  </div>
                                </div>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>

                          <nz-col nzXs="24" nzSm="12" nzMd="12" nzLg="12" nzXl="12">
                            <nz-space nzDirection="vertical" nzSize="middle" style="width: 100%;">
                              <nz-form-item>
                                <nz-form-control>
                                  <label nz-checkbox formControlName="newsletter">
                                    <nz-space nzAlign="center" nzSize="small">
                                      <i nz-icon nzType="notification"></i>
                                      <span>Subscribe to newsletter</span>
                                    </nz-space>
                                  </label>
                                </nz-form-control>
                              </nz-form-item>

                              <nz-form-item>
                                <nz-form-control nzErrorTip="You must accept the terms and conditions" [nzValidateStatus]="termsControl.invalid && termsControl.touched ? 'error' : ''">
                                  <label nz-checkbox formControlName="terms">
                                    <nz-space nzAlign="center" nzSize="small">
                                      <i nz-icon nzType="safety-certificate"></i>
                                      <span>I agree to the terms and conditions *</span>
                                    </nz-space>
                                  </label>
                                </nz-form-control>
                              </nz-form-item>
                            </nz-space>
                          </nz-col>
                          
                          <nz-col nzSpan="24">
                            <nz-divider></nz-divider>
                            <nz-form-item>
                              <nz-form-control>
                                <nz-space>
                                  <button nz-button nzType="primary" nzSize="large" [nzLoading]="isSubmitting" type="submit" [disabled]="basicForm.invalid">
                                    <i nz-icon nzType="user-add"></i>
                                    Create Account
                                  </button>
                                  <button nz-button nzType="default" nzSize="large" type="button" (click)="onResetForm('basic')">
                                    <i nz-icon nzType="reload"></i>
                                    Clear Form
                                  </button>
                                  <button nz-button nzType="dashed" nzSize="large" type="button" (click)="onSaveDraft('basic')">
                                    <i nz-icon nzType="save"></i>
                                    Save Draft
                                  </button>
                                </nz-space>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                        </nz-row>
                      </form>
                      
                      <!-- Form State Information -->
                      <nz-divider nzText="Form State & Validation" nzOrientation="left"></nz-divider>
                      <nz-alert
                        nzType="info"
                        nzShowIcon
                        [nzMessage]="getFormStateMessage('basic')"
                        [nzDescription]="getFormStateDescription('basic')"
                        style="margin-top: 16px;">
                      </nz-alert>
                    </nz-card>
                  </nz-space>
                  </ng-template>
                </nz-tab>

                <!-- Advanced Form Demo -->
                <nz-tab nzTitle="Project Config">
                  <ng-template nz-tab>
                    <nz-space nzAlign="center">
                      <i nz-icon nzType="setting"></i>
                      <span>Project Config</span>
                    </nz-space>
                 
                  
                  <nz-space nzDirection="vertical" nzSize="large" style="width: 100%;">
                    <nz-card nzTitle="Project Configuration">
                      <ng-template #title>
                        <nz-space nzAlign="center">
                          <i nz-icon nzType="setting" class="ant-typography-text-primary"></i>
                          <span>Project Configuration</span>
                        </nz-space>
                      </ng-template>
                      
                      <p nz-typography class="ant-typography-text-secondary">
                        Configure your project settings with multiple sections and validation
                      </p>
                      
                      <form nz-form [nzLayout]="'vertical'" [formGroup]="advancedForm" (ngSubmit)="onAdvancedFormSubmit()">
                        <nz-row [nzGutter]="[24, 16]">
                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="8" nzXl="8">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="file-text"></i>
                                  <span>Project Name</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Please enter the project name" [nzValidateStatus]="projectNameControl.invalid && projectNameControl.touched ? 'error' : ''">
                                <input 
                                  nz-input 
                                  placeholder="Enter project name" 
                                  maxlength="100"
                                  size="large"
                                  formControlName="projectName">
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>

                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="8" nzXl="8">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="appstore"></i>
                                  <span>Project Type</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Please select the project type" [nzValidateStatus]="projectTypeControl.invalid && projectTypeControl.touched ? 'error' : ''">
                                <nz-select 
                                  nzPlaceHolder="Select project type"
                                  nzSize="large"
                                  formControlName="projectType">
                                  <nz-option 
                                    *ngFor="let option of projectTypeOptions" 
                                    [nzValue]="option.value" 
                                    [nzLabel]="option.label">
                                  </nz-option>
                                </nz-select>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>

                          <nz-col nzXs="24" nzSm="24" nzMd="24" nzLg="8" nzXl="8">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="calendar"></i>
                                  <span>Project Timeline</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Please select the timeline" [nzValidateStatus]="timelineControl.invalid && timelineControl.touched ? 'error' : ''">
                                <nz-range-picker 
                                  [nzPlaceHolder]="['Start date', 'End date']"
                                  formControlName="timeline"
                                  nzSize="large"
                                  style="width: 100%">
                                </nz-range-picker>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                          
                          <nz-col nzSpan="24">
                            <nz-divider></nz-divider>
                            <nz-form-item>
                              <nz-form-control>
                                <nz-space>
                                  <button nz-button nzType="primary" nzSize="large" [nzLoading]="isSubmitting" type="submit" [disabled]="advancedForm.invalid">
                                    <i nz-icon nzType="save"></i>
                                    Save Configuration
                                  </button>
                                  <button nz-button nzType="default" nzSize="large" type="button" (click)="onResetForm('advanced')">
                                    <i nz-icon nzType="reload"></i>
                                    Reset
                                  </button>
                                  <button nz-button nzType="default" nzSize="large" type="button" (click)="onFormCancel()">
                                    <i nz-icon nzType="close"></i>
                                    Cancel
                                  </button>
                                </nz-space>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                        </nz-row>
                      </form>
                      
                      <!-- Form State Information -->
                      <nz-divider nzText="Form State & Validation" nzOrientation="left"></nz-divider>
                      <nz-alert
                        nzType="info"
                        nzShowIcon
                        [nzMessage]="getFormStateMessage('advanced')"
                        [nzDescription]="getFormStateDescription('advanced')"
                        style="margin-top: 16px;">
                      </nz-alert>
                    </nz-card>
                  </nz-space>
                  </ng-template>
                </nz-tab>

                <!-- Validation Demo -->
                <nz-tab nzTitle="Validation Examples">
                  <ng-template nz-tab>
                    <nz-space nzAlign="center">
                      <i nz-icon nzType="safety-certificate"></i>
                      <span>Validation Examples</span>
                    </nz-space>
                 

                  <nz-space nzDirection="vertical" nzSize="large" style="width: 100%; height: 100%;">
                    <nz-card nzTitle="Form Validation Examples">
                      <ng-template #title>
                        <nz-space nzAlign="center">
                          <i nz-icon nzType="safety-certificate" class="ant-typography-text-primary"></i>
                          <span>Form Validation Examples</span>
                        </nz-space>
                      </ng-template>
                      
                      <p nz-typography class="ant-typography-text-secondary">
                        Demonstrates various validation patterns and custom validators
                      </p>
                      
                      <form nz-form [nzLayout]="'vertical'" [formGroup]="validationForm" (ngSubmit)="onValidationFormSubmit()">
                        <nz-row [nzGutter]="[24, 16]">
                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="user"></i>
                                  <span>Username</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Username must be at least 3 characters with no spaces" [nzValidateStatus]="usernameControl.invalid && usernameControl.touched ? 'error' : ''">
                                <input 
                                  nz-input 
                                  placeholder="Enter username (min 3 chars, no spaces)" 
                                  formControlName="username"
                                  size="large"
                                  nz-tooltip
                                  nzTooltipTitle="Must be at least 3 characters, no spaces allowed">
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>

                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="lock"></i>
                                  <span>Password</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Password must contain uppercase, lowercase, number and special character" [nzValidateStatus]="passwordControl.invalid && passwordControl.touched ? 'error' : ''">
                                <nz-input-group nzPrefixIcon="lock" nzSize="large">
                                  <input 
                                    nz-input 
                                    type="password"
                                    placeholder="Enter password" 
                                    formControlName="password"
                                    nz-tooltip
                                    nzTooltipTitle="Must contain uppercase, lowercase, number and special character">
                                </nz-input-group>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>

                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="lock"></i>
                                  <span>Confirm Password</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Passwords must match" [nzValidateStatus]="confirmPasswordControl.invalid && confirmPasswordControl.touched ? 'error' : ''">
                                <nz-input-group nzPrefixIcon="lock" nzSize="large">
                                  <input 
                                    nz-input 
                                    type="password"
                                    placeholder="Confirm password" 
                                    formControlName="confirmPassword"
                                    nz-tooltip
                                    nzTooltipTitle="Must match the password above">
                                </nz-input-group>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                          
                          <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                            <nz-form-item>
                              <nz-form-label [nzRequired]="true">
                                <nz-space nzAlign="center" nzSize="small">
                                  <i nz-icon nzType="number"></i>
                                  <span>Age</span>
                                </nz-space>
                              </nz-form-label>
                              <nz-form-control nzErrorTip="Age must be between 18 and 100" [nzValidateStatus]="ageControl.invalid && ageControl.touched ? 'error' : ''">
                                <nz-input-number
                                  [nzMin]="18"
                                  [nzMax]="100"
                                  nzPlaceHolder="Enter your age"
                                  formControlName="age"
                                  nzSize="large"
                                  style="width: 100%">
                                </nz-input-number>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                        <!-- You can move the text transfer component outside of the Age form item, for example: -->
                        <nz-col nzXs="24" nzSm="24" nzMd="12" nzLg="12" nzXl="12">
                          <nz-form-item>
                            <nz-form-label [nzRequired]="true">
                              <nz-space nzAlign="center" nzSize="small">
                                <i nz-icon nzType="number"></i>
                                <span>Age</span>
                              </nz-space>
                            </nz-form-label>
                            <nz-form-control nzErrorTip="Age must be between 18 and 100" [nzValidateStatus]="ageControl.invalid && ageControl.touched ? 'error' : ''">
                              <nz-input-number
                                [nzMin]="18"
                                [nzMax]="100"
                                nzPlaceHolder="Enter your age"
                                formControlName="age"
                                nzSize="large"
                                style="width: 100%">
                              </nz-input-number>
                            </nz-form-control>
                          </nz-form-item>
                        </nz-col>
                        <!-- Place the text transfer component in its own row/col below -->
                        <nz-col nzSpan="24">
                        <nz-divider nzText="Text Transfer Demo" nzOrientation="left"></nz-divider>
                          <app-text-transfer
                            [leftText]="validationForm.get('username')?.value"
                            [rightText]="validationForm.get('password')?.value"
                            (leftTextChange)="validationForm.get('username')?.setValue($event)"
                            (rightTextChange)="validationForm.get('password')?.setValue($event)"
                            leftPlaceholder="Username (min 3 chars, no spaces)"
                            rightPlaceholder="Password (strong password)"
                            [buttonType]="'primary'"
                            [buttonShape]="'circle'"
                            [buttonIcon]="'arrow-right'"
                            [leftRows]="4"
                            [rightRows]="4"
                            [leftColSpan]="12"
                            [rightColSpan]="12"
                            [buttonColSpan]="4"
                          ></app-text-transfer>
                        </nz-col>
                        

                          
                          <nz-col nzSpan="24">
                            <nz-divider></nz-divider>
                            <nz-form-item>
                              <nz-form-control>
                                <nz-space>
                                  <button nz-button nzType="primary" nzSize="large" [nzLoading]="isSubmitting" type="submit" [disabled]="validationForm.invalid">
                                    <i nz-icon nzType="check-circle"></i>
                                    Validate & Submit
                                  </button>
                                  <button nz-button nzType="default" nzSize="large" type="button" (click)="onResetForm('validation')">
                                    <i nz-icon nzType="reload"></i>
                                    Reset
                                  </button>
                                </nz-space>
                              </nz-form-control>
                            </nz-form-item>
                          </nz-col>
                        </nz-row>
                      </form>
                      
                      <!-- Form State Information -->
                      <nz-divider nzText="Validation Status" nzOrientation="left"></nz-divider>
                      <nz-alert
                        nzType="info"
                        nzShowIcon
                        [nzMessage]="getFormStateMessage('validation')"
                        [nzDescription]="getFormStateDescription('validation')"
                        style="margin-top: 16px;">
                      </nz-alert>
                    </nz-card>
                  </nz-space>
                  </ng-template>
                </nz-tab>
                
              </nz-tabset>

        <!-- Demo Controls -->
        <nz-divider>
          <span nz-typography class="ant-typography-text-primary">
            <i nz-icon nzType="setting"></i>
            Demo Controls
          </span>
        </nz-divider>
        
        <nz-card nzTitle="Configuration Options">
          <ng-template #title>
            <nz-space nzAlign="center">
              <i nz-icon nzType="control"></i>
              <span>Configuration Options</span>
            </nz-space>
          </ng-template>
          
          <nz-row [nzGutter]="[24, 16]">
            <nz-col nzXs="24" nzSm="8" nzMd="8" nzLg="8" nzXl="8">
              <nz-space nzDirection="vertical" nzSize="small" style="width: 100%;">
                <label nz-checkbox [(ngModel)]="enableAutoSave">
                  <nz-space nzAlign="center" nzSize="small">
                    <i nz-icon nzType="save"></i>
                    <span>Enable Auto-save</span>
                  </nz-space>
                </label>
                <small nz-typography class="ant-typography-caption">
                  Automatically save form data while typing
                </small>
              </nz-space>
            </nz-col>
            
            <nz-col nzXs="24" nzSm="8" nzMd="8" nzLg="8" nzXl="8">
              <nz-space nzDirection="vertical" nzSize="small" style="width: 100%;">
                <label nz-checkbox [(ngModel)]="showFormErrors">
                  <nz-space nzAlign="center" nzSize="small">
                    <i nz-icon nzType="exclamation-circle"></i>
                    <span>Show Form Errors</span>
                  </nz-space>
                </label>
                <small nz-typography class="ant-typography-caption">
                  Display validation errors in real-time
                </small>
              </nz-space>
            </nz-col>
            
            <nz-col nzXs="24" nzSm="8" nzMd="8" nzLg="8" nzXl="8">
              <nz-space nzDirection="vertical" nzSize="small" style="width: 100%;">
                <label nz-checkbox [(ngModel)]="validateOnChange">
                  <nz-space nzAlign="center" nzSize="small">
                    <i nz-icon nzType="check-circle"></i>
                    <span>Validate on Change</span>
                  </nz-space>
                </label>
                <small nz-typography class="ant-typography-caption">
                  Validate fields as user types
                </small>
              </nz-space>
            </nz-col>
          </nz-row>
        </nz-card>

        <!-- Form State Display -->
        <nz-divider>
          <span nz-typography class="ant-typography-text-primary">
            <i nz-icon nzType="code"></i>
            Current Form State
          </span>
        </nz-divider>
        
        <nz-card>
          <ng-template #title>
            <nz-space nzAlign="center">
              <i nz-icon nzType="file-text"></i>
              <span>Form State JSON</span>
              <nz-tag nzColor="blue" *ngIf="currentFormState">
                {{ currentFormState.isDirty ? 'Modified' : 'Clean' }}
              </nz-tag>
            </nz-space>
          </ng-template>
          
          <nz-spin [nzSpinning]="!currentFormState" nzTip="Loading form state...">
            <div class="ant-typography">
              <pre class="ant-typography-text">{{ currentFormState | json }}</pre>
            </div>
          </nz-spin>
        </nz-card>

        <!-- Last Action Display -->
        <div *ngIf="lastAction">
          <nz-space nzDirection="vertical" nzSize="middle" style="width: 100%; margin-top: 24px;">
            <nz-alert
              [nzType]="getAlertType()"
              [nzMessage]="lastAction.message"
              [nzDescription]="lastAction.details || ''"
              nzShowIcon
              nzCloseable
              (nzOnClose)="lastAction = null">
              
              <ng-template #nzIconTemplate>
                <i nz-icon 
                   [nzType]="getAlertType() === 'success' ? 'check-circle' : 
                             getAlertType() === 'warning' ? 'exclamation-circle' :
                             getAlertType() === 'error' ? 'close-circle' : 'info-circle'">
                </i>
              </ng-template>
            </nz-alert>
          </nz-space>
        </div>

            </nz-card>
          </nz-space>
        </nz-col>
      </nz-row>
    </div>

  `,
  styles: [`
    /* Minimal Ant Design overrides - leverage maximum built-in styles */
    .ant-layout-content {
      background: #f0f2f5;
      min-height: 100vh;
    }
    
    .ant-typography-text {
      font-size: 12px;
      max-height: 250px;
      overflow-y: auto;
      background: #fafafa;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #d9d9d9;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
    }

    /* Ensure proper spacing for Ant Design grid system */
    ::ng-deep .ant-row {
      margin-left: 0 !important;
      margin-right: 0 !important;
    }
    
    /* Enhanced form field styling */
    ::ng-deep .ant-form-item {
      margin-bottom: 16px;
    }
    
    /* Typography enhancements */
    .ant-typography-caption {
      color: rgba(0, 0, 0, 0.45);
      font-size: 12px;
    }
    
    .ant-typography-text-primary {
      color: #1890ff;
    }
    
    .ant-typography-text-secondary {
      color: rgba(0, 0, 0, 0.65);
    }
  `]
})
export class FormsDemoComponent implements OnInit, OnDestroy {
  public basicForm!: FormGroup;
  public advancedForm!: FormGroup;
  public validationForm!: FormGroup;
  
  public currentFormState: FormState | null = null;
  public lastAction: {type: string, message: string, details?: string} | null = null;
  public isSubmitting = false;

  // --- Patch: Set initial form state to avoid infinite spinner ---
  // Demo controls
  public enableAutoSave = true;
  public showFormErrors = true;
  public validateOnChange = true;

  // Form options
  public countryOptions: SelectOption[] = [
    { label: 'United States', value: 'US', icon: 'flag' },
    { label: 'Canada', value: 'CA', icon: 'flag' },
    { label: 'United Kingdom', value: 'UK', icon: 'flag' },
    { label: 'Germany', value: 'DE', icon: 'flag' },
    { label: 'France', value: 'FR', icon: 'flag' },
    { label: 'Japan', value: 'JP', icon: 'flag' }
  ];

  public projectTypeOptions: SelectOption[] = [
    { label: 'Web Application', value: 'web' },
    { label: 'Mobile App', value: 'mobile' },
    { label: 'Desktop Software', value: 'desktop' },
    { label: 'API Service', value: 'api' },
    { label: 'Data Analysis', value: 'data' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    // Set initial form state for display
    this.currentFormState = {
      isDirty: false,
      isValid: true,
      isPending: false,
      isSubmitting: false
    };
  }

  private initializeForms(): void {
    // Basic Form
    this.basicForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      country: ['', Validators.required],
      dateOfBirth: [''],
      bio: [''],
      newsletter: [false],
      terms: [false, Validators.requiredTrue]
    });

    // Advanced Form
    this.advancedForm = this.fb.group({
      projectName: ['', [Validators.required, Validators.maxLength(100)]],
      projectType: ['', Validators.required],
      timeline: ['', Validators.required],
      teamLead: [''],
      teamSize: [1, [Validators.min(1), Validators.max(100)]],
      budget: [''],
      securityLevel: ['medium'],
      enableNotifications: [true],
      backupEnabled: [true]
    });

    // Validation Form
    this.validationForm = this.fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        this.noSpacesValidator
      ]],
      password: ['', [
        Validators.required,
        this.strongPasswordValidator
      ]],
      confirmPassword: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18), Validators.max(120)]],
      website: ['', this.urlValidator]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Custom Validators
  private noSpacesValidator(control: AbstractControl) {
    if (control.value && control.value.includes(' ')) {
      return { noSpaces: true };
    }
    return null;
  }

  private strongPasswordValidator(control: AbstractControl) {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLengthValid = value.length >= 8;

    const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && isLengthValid;
    
    if (!valid) {
      return { strongPassword: true };
    }
    return null;
  }

  private urlValidator(control: AbstractControl) {
    if (!control.value) return null;
    
    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  }

  private passwordMatchValidator(form: AbstractControl) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  // Date picker helper
  disableFutureDates = (current: Date): boolean => {
    return current > new Date();
  };

  // Event Handlers
  onBasicFormSubmit(): void {
    if (this.basicForm.valid) {
      this.isSubmitting = true;
      this.lastAction = {
        type: 'success',
        message: 'Basic Form Submitted',
        details: `Form submitted with ${Object.keys(this.basicForm.value).length} fields`
      };
      
      setTimeout(() => {
        this.message.success('User account created successfully!');
        this.isSubmitting = false;
        console.log('Basic Form Value:', this.basicForm.value);
      }, 1000);
    } else {
      this.message.error('Please fix form errors before submitting');
    }
  }

  onAdvancedFormSubmit(): void {
    if (this.advancedForm.valid) {
      this.isSubmitting = true;
      this.lastAction = {
        type: 'success',
        message: 'Advanced Form Submitted',
        details: `Total fields: ${Object.keys(this.advancedForm.value).length}`
      };
      
      setTimeout(() => {
        this.message.success('Project configuration saved!');
        this.isSubmitting = false;
        console.log('Advanced Form Value:', this.advancedForm.value);
      }, 1000);
    } else {
      this.message.error('Please fix form errors before submitting');
    }
  }

  onValidationFormSubmit(): void {
    if (this.validationForm.valid) {
      this.isSubmitting = true;
      this.lastAction = {
        type: 'success',
        message: 'Validation Form Submitted',
        details: 'All validations passed successfully'
      };
      
      setTimeout(() => {
        this.message.success('Form validation completed!');
        this.isSubmitting = false;
        console.log('Validation Form Value:', this.validationForm.value);
      }, 1000);
    } else {
      this.message.error('Please fix validation errors before submitting');
    }
  }

  onFormCancel(): void {
    this.lastAction = {
      type: 'warning',
      message: 'Form Cancelled',
      details: 'User cancelled the form operation'
    };
    
    this.message.warning('Form operation cancelled');
  }

  onAutoSave(data: any): void {
    this.lastAction = {
      type: 'info',
      message: 'Auto-save Triggered',
      details: `Saved at ${new Date().toLocaleTimeString()}`
    };
  }

  onDraftSave(data: any): void {
    this.lastAction = {
      type: 'info',
      message: 'Draft Saved',
      details: 'Form data saved as draft'
    };
    
    this.message.info('Draft saved successfully');
  }

  onFormStateChange(state: FormState): void {
    this.currentFormState = state;
  }

  onFieldChange(event: {field: string, value: any, previousValue: any}): void {
    console.log('Field changed:', event);
  }

  getAlertType(): 'success' | 'info' | 'warning' | 'error' {
    if (!this.lastAction) return 'info';
    const type = this.lastAction.type;
    if (['success', 'info', 'warning', 'error'].includes(type)) {
      return type as 'success' | 'info' | 'warning' | 'error';
    }
    return 'info';
  }

  // Utility methods
  public onResetForm(formType: string): void {
    switch (formType) {
      case 'basic':
        this.basicForm.reset();
        this.message.info('Basic form has been reset');
        break;
      case 'advanced':
        this.advancedForm.reset();
        this.message.info('Advanced form has been reset');
        break;
      case 'validation':
        this.validationForm.reset();
        this.message.info('Validation form has been reset');
        break;
    }
  }

  public onSaveDraft(formType: string): void {
    const form = formType === 'basic' ? this.basicForm : 
                 formType === 'advanced' ? this.advancedForm : this.validationForm;
    
    localStorage.setItem(`draft_${formType}`, JSON.stringify(form.value));
    this.message.success(`${formType} form draft saved!`);
  }

  public getFormStateMessage(formType: string): string {
    const form = formType === 'basic' ? this.basicForm : 
                 formType === 'advanced' ? this.advancedForm : this.validationForm;
    
    if (form.invalid) {
      return 'Form contains validation errors';
    } else if (form.dirty) {
      return 'Form has unsaved changes';
    } else {
      return 'Form is ready';
    }
  }

  public getFormStateDescription(formType: string): string {
    const form = formType === 'basic' ? this.basicForm : 
                 formType === 'advanced' ? this.advancedForm : this.validationForm;
    
    const errors = this.getFormErrorCount(form);
    const touched = this.getTouchedFieldCount(form);
    
    return `Errors: ${errors}, Touched fields: ${touched}, Valid: ${form.valid ? 'Yes' : 'No'}`;
  }

  private getFormErrorCount(form: FormGroup): number {
    let count = 0;
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control?.errors) {
        count++;
      }
    });
    return count;
  }

  private getTouchedFieldCount(form: FormGroup): number {
    let count = 0;
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control?.touched) {
        count++;
      }
    });
    return count;
  }

  // Form control getters for template binding
  // Basic Form Controls
  get fullNameControl() { return this.basicForm.get('fullName') as FormControl; }
  get emailControl() { return this.basicForm.get('email') as FormControl; }
  get phoneControl() { return this.basicForm.get('phone') as FormControl; }
  get countryControl() { return this.basicForm.get('country') as FormControl; }
  get dateOfBirthControl() { return this.basicForm.get('dateOfBirth') as FormControl; }
  get bioControl() { return this.basicForm.get('bio') as FormControl; }
  get newsletterControl() { return this.basicForm.get('newsletter') as FormControl; }
  get termsControl() { return this.basicForm.get('terms') as FormControl; }

  // Advanced Form Controls
  get projectNameControl() { return this.advancedForm.get('projectName') as FormControl; }
  get projectTypeControl() { return this.advancedForm.get('projectType') as FormControl; }
  get timelineControl() { return this.advancedForm.get('timeline') as FormControl; }

  // Validation Form Controls
  get usernameControl() { return this.validationForm.get('username') as FormControl; }
  get passwordControl() { return this.validationForm.get('password') as FormControl; }
  get confirmPasswordControl() { return this.validationForm.get('confirmPassword') as FormControl; }
  get ageControl() { return this.validationForm.get('age') as FormControl; }
  get websiteControl() { return this.validationForm.get('website') as FormControl; }
  
  onSimpleTestSubmit(): void {
    if (this.basicForm.valid) {
      this.lastAction = {
        type: 'success',
        message: 'Simple Test Form Submitted',
        details: `Form values: ${JSON.stringify(this.basicForm.value)}`
      };
      this.message.success('Test form submitted successfully!');
    } else {
      this.message.error('Please fill in all required fields');
    }
  }
}
