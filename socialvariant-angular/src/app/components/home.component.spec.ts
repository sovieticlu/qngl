import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { MetaService } from '../services/meta.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let metaServiceSpy: jasmine.SpyObj<MetaService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MetaService', ['updateMetaTags']);

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterModule.forRoot([])],
      providers: [
        { provide: MetaService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    metaServiceSpy = TestBed.inject(MetaService) as jasmine.SpyObj<MetaService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update meta tags on init', () => {
    component.ngOnInit();
    expect(metaServiceSpy.updateMetaTags).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'SocialVariant - Angular Meta Tags Demo',
        type: 'website'
      })
    );
  });

  it('should render hero section', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hero-title')?.textContent).toContain('Welcome to SocialVariant');
  });

  it('should render features section', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const featureCards = compiled.querySelectorAll('.feature-card');
    expect(featureCards.length).toBe(4);
  });
});
