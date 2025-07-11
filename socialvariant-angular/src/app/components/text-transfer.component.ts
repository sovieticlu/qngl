import { Component } from '@angular/core';
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
  leftText = '';
  rightText = '';

  transferText() {
    this.rightText = this.leftText;
  }
}
