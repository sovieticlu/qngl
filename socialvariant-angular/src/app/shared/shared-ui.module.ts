import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe, NgForOf, NgIf } from '@angular/common';

import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';

import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
//import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzRateModule } from 'ng-zorro-antd/rate';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
//import { BrowserModule } from '@angular/platform-browser';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzSpaceComponent } from 'ng-zorro-antd/space';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NzMentionModule } from 'ng-zorro-antd/mention';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzPageHeaderModule,
    NzCardModule,
    NzButtonModule,
    NzAutocompleteModule,
    NzCheckboxModule,
    NzRadioModule,
    NzEmptyModule,
    NzGridModule,
    NzDatePickerModule,
    NzFormModule,
    NzLayoutModule,
    NzStatisticModule,
    NzDividerModule,
    NzSelectModule,
    NzIconModule,
    NzToolTipModule,
    NzCollapseModule,
    //NzBadgeModule,
    NzSpinModule,
    NzDescriptionsModule,
    NzTagModule,
    NzSliderModule,
    NzRateModule,
    NzModalModule,
  
    NzTableModule,
    NzFormModule,
    NgForOf,
    NgIf,
        JsonPipe,
        NzBreadCrumbModule,
        NzAvatarModule,
        NzDropDownModule,
        //BrowserModule,
        
        NzSelectModule,
        NzSliderModule,
        NzRateModule,
        NzSegmentedModule,
        NzInputNumberModule,
        NzSkeletonModule,
        NzSpaceComponent,
        NzPopoverModule,
        MatFormFieldModule,
        NzPopoverModule,
      NzSpaceComponent,
        NzMentionModule
        
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzPageHeaderModule,
    NzCardModule,
    NzButtonModule,
    NzAutocompleteModule,
    NzCheckboxModule,
    NzRadioModule,
    NzEmptyModule,
    NzGridModule,
    NzDatePickerModule,
    NzFormModule,
    NzLayoutModule,
    NzStatisticModule,
    NzDividerModule,
    NzSelectModule,
    NzIconModule,
    NzToolTipModule,
    NzCollapseModule,
    //NzBadgeModule,
    NzSpinModule,
    NzDescriptionsModule,
    NzTagModule,
    NzSliderModule,
    NzRateModule,
    NzModalModule,
    NzTableModule,
    NzFormModule,
    NgForOf,
    NgIf,
      JsonPipe,
      NzBreadCrumbModule,
      NzAvatarModule,
      NzDropDownModule,
      //BrowserModule,
      NzSliderModule,
      NzRateModule,
      NzSegmentedModule,
      NzInputNumberModule,
      NzSkeletonModule,
      NzPopoverModule,
      MatFormFieldModule,
NzPopoverModule,
      NzSpaceComponent,
      NzMentionModule
  ]
})
export class SharedUiModule {} 
