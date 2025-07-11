import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-text-transfer',
  standalone: true,
  imports: [FormsModule, NzButtonModule, NzInputModule, NzGridModule, NzIconModule],
  template: `
    <nz-row [nzGutter]="16" style="align-items: center;">
      <nz-col nzSpan="10">
        <textarea nz-input [(ngModel)]="leftText" rows="8" placeholder="Left textarea"></textarea>
      </nz-col>
      <nz-col nzSpan="4" style="text-align: center;">
        <button nz-button nzType="primary" nzShape="circle" (click)="transferText()" [disabled]="!leftText">
          <i nz-icon nzType="arrow-right"></i>
        </button>
      </nz-col>
      <nz-col nzSpan="10">
        <textarea nz-input [(ngModel)]="rightText" rows="8" placeholder="Right textarea"></textarea>
      </nz-col>
    </nz-row>
  `,
  styles: [`
    textarea[nz-input] {
      width: 100%;
      resize: vertical;
    }
  `]
})
export class TextTransferComponent {
  @Input() leftText: string = '';
  @Input() rightText: string = '';
  @Input() leftPlaceholder: string = '';
  @Input() rightPlaceholder: string = '';
  @Input() buttonType: string = 'default';
  @Input() buttonShape: string = 'default';
  @Input() buttonIcon: string = '';
  @Input() leftRows: number = 2;
  @Input() rightRows: number = 2;
  @Input() leftColSpan: number = 12;
  @Input() rightColSpan: number = 12;
  @Input() buttonColSpan: number = 4;

  @Output() leftTextChange = new EventEmitter<string>();
  @Output() rightTextChange = new EventEmitter<string>();
  transferText() {
    this.rightText = this.leftText;
  }
}
