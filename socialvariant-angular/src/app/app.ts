import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServicesInitializerService } from './services/services-initializer.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  title = 'SocialVariant Angular';

  constructor(private servicesInitializer: ServicesInitializerService) {}

  ngOnInit(): void {
    // Initialize all services on app startup
    this.servicesInitializer.initialize();
  }
}
