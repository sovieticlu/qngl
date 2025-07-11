import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DocumentHeadService } from '../services/document-head.service';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-page">
      <div class="container">
        <header class="page-header">
          <nav class="breadcrumb">
            <a routerLink="/admin">{{ translate('admin.dashboard') }}</a>
            <span class="separator">/</span>
            <span class="current">{{ translate('admin.settings') }}</span>
          </nav>
          <h1>{{ translate('admin.system_settings') }}</h1>
        </header>

        <div class="content-placeholder">
          <div class="placeholder-icon">⚙️</div>
          <h2>{{ translate('admin.settings_coming_soon') }}</h2>
          <p>{{ translate('admin.feature_development_message') }}</p>
          <a routerLink="/admin" class="back-btn">
            ← {{ translate('admin.back_to_dashboard') }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-page {
      min-height: 100vh;
      background: #f8f9fa;
      padding: 2rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .page-header {
      margin-bottom: 3rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      
      a {
        color: #007bff;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
      
      .separator {
        color: #6c757d;
      }
      
      .current {
        color: #6c757d;
        font-weight: 500;
      }
    }

    .page-header h1 {
      color: #343a40;
      font-size: 2rem;
      margin: 0;
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
        margin-bottom: 2rem;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
      }
      
      .back-btn {
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 500;
        transition: background 0.3s ease;
        
        &:hover {
          background: #0056b3;
        }
      }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  constructor(
    private documentHeadService: DocumentHeadService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.documentHeadService.updateHead({
      title: this.translate('admin.system_settings'),
      description: this.translate('admin.settings_description'),
      keywords: 'admin, settings, configuration, system, SocialVariant',
      robots: 'noindex,nofollow'
    });
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }
}
