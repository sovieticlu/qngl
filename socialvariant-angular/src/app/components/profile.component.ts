import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentHeadService } from '../services/document-head.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-page">
      <div class="page-header">
        <h1>{{ translate('profile.title') }}</h1>
        <p>{{ translate('profile.subtitle') }}</p>
      </div>

      <div class="content-placeholder">
        <div class="placeholder-icon">👤</div>
        <h2>{{ translate('profile.coming_soon') }}</h2>
        <p>{{ translate('profile.development_message') }}</p>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
      
      h1 {
        color: #343a40;
        margin-bottom: 0.5rem;
      }
      
      p {
        color: #6c757d;
        margin: 0;
      }
    }

    .content-placeholder {
      text-align: center;
      background: white;
      border-radius: 12px;
      padding: 4rem 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      
      .placeholder-icon {
        font-size: 4rem;
        margin-bottom: 1.5rem;
        opacity: 0.6;
      }
      
      h2 {
        color: #343a40;
        margin-bottom: 1rem;
      }
      
      p {
        color: #6c757d;
        max-width: 500px;
        margin: 0 auto;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  constructor(
    private documentHeadService: DocumentHeadService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.documentHeadService.updateHead({
      title: this.translate('profile.title'),
      description: this.translate('profile.description'),
      keywords: 'profile, user, account, settings, SocialVariant'
    });
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }
}
