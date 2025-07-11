import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageExampleComponent } from './page-example.component';
import { MetaService } from '../services/meta.service';

describe('PageExampleComponent', () => {
  let component: PageExampleComponent;
  let fixture: ComponentFixture<PageExampleComponent>;
  let metaServiceSpy: jasmine.SpyObj<MetaService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MetaService', ['updateMetaTags']);

    await TestBed.configureTestingModule({
      imports: [PageExampleComponent],
      providers: [
        { provide: MetaService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PageExampleComponent);
    component = fixture.componentInstance;
    metaServiceSpy = TestBed.inject(MetaService) as jasmine.SpyObj<MetaService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update meta tags on init', () => {
    component.ngOnInit();
    expect(metaServiceSpy.updateMetaTags).toHaveBeenCalled();
  });

  it('should update blog post meta tags', () => {
    component.updateBlogPost();
    expect(metaServiceSpy.updateMetaTags).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'How to Implement Dynamic Meta Tags in Angular',
        type: 'article'
      })
    );
  });

  it('should update product meta tags', () => {
    component.updateProduct();
    expect(metaServiceSpy.updateMetaTags).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Amazing Product - SocialVariant Store',
        type: 'product'
      })
    );
  });
});
