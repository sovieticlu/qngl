import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { MetaService } from './meta.service';

describe('MetaService', () => {
  let service: MetaService;
  let metaSpy: jasmine.SpyObj<Meta>;
  let titleSpy: jasmine.SpyObj<Title>;

  beforeEach(() => {
    const metaSpyObj = jasmine.createSpyObj('Meta', ['getTag', 'updateTag', 'addTag', 'removeTag']);
    const titleSpyObj = jasmine.createSpyObj('Title', ['setTitle']);

    TestBed.configureTestingModule({
      providers: [
        MetaService,
        { provide: Meta, useValue: metaSpyObj },
        { provide: Title, useValue: titleSpyObj }
      ]
    });
    
    service = TestBed.inject(MetaService);
    metaSpy = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;
    titleSpy = TestBed.inject(Title) as jasmine.SpyObj<Title>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update title when provided', () => {
    const testTitle = 'Test Title';
    
    service.updateMetaTags({ title: testTitle });
    
    expect(titleSpy.setTitle).toHaveBeenCalledWith(testTitle);
  });

  it('should add meta tag when it does not exist', () => {
    metaSpy.getTag.and.returnValue(null);
    
    service.updateMetaTags({ description: 'Test description' });
    
    expect(metaSpy.addTag).toHaveBeenCalledWith({ name: 'description', content: 'Test description' });
  });

  it('should update meta tag when it already exists', () => {
    metaSpy.getTag.and.returnValue({} as HTMLMetaElement);
    
    service.updateMetaTags({ description: 'Updated description' });
    
    expect(metaSpy.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Updated description' });
  });

  it('should set default Open Graph type when not provided', () => {
    metaSpy.getTag.and.returnValue(null);
    
    service.updateMetaTags({ title: 'Test' });
    
    expect(metaSpy.addTag).toHaveBeenCalledWith({ property: 'og:type', content: 'website' });
  });

  it('should set default Twitter card when not provided', () => {
    metaSpy.getTag.and.returnValue(null);
    
    service.updateMetaTags({ title: 'Test' });
    
    expect(metaSpy.addTag).toHaveBeenCalledWith({ name: 'twitter:card', content: 'summary_large_image' });
  });

  it('should remove tag when removeTag is called', () => {
    service.removeTag('name', 'description');
    
    expect(metaSpy.removeTag).toHaveBeenCalledWith('name="description"');
  });
});
