import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { DocumentHeadService, DocumentHeadConfig } from './document-head.service';

describe('DocumentHeadService', () => {
  let service: DocumentHeadService;
  let titleService: jasmine.SpyObj<Title>;
  let metaService: jasmine.SpyObj<Meta>;

  beforeEach(() => {
    const titleSpy = jasmine.createSpyObj('Title', ['setTitle', 'getTitle']);
    const metaSpy = jasmine.createSpyObj('Meta', ['getTag', 'updateTag', 'addTag', 'removeTag']);

    TestBed.configureTestingModule({
      providers: [
        DocumentHeadService,
        { provide: Title, useValue: titleSpy },
        { provide: Meta, useValue: metaSpy }
      ]
    });

    service = TestBed.inject(DocumentHeadService);
    titleService = TestBed.inject(Title) as jasmine.SpyObj<Title>;
    metaService = TestBed.inject(Meta) as jasmine.SpyObj<Meta>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateHead', () => {
    it('should update title when provided', () => {
      const config: DocumentHeadConfig = {
        title: 'Test Page Title'
      };

      service.updateHead(config);

      expect(titleService.setTitle).toHaveBeenCalledWith('Test Page Title');
    });

    it('should update basic meta tags', () => {
      metaService.getTag.and.returnValue(null);
      const config: DocumentHeadConfig = {
        description: 'Test description',
        keywords: 'test, keywords',
        author: 'Test Author'
      };

      service.updateHead(config);

      expect(metaService.addTag).toHaveBeenCalledWith({ name: 'description', content: 'Test description' });
      expect(metaService.addTag).toHaveBeenCalledWith({ name: 'keywords', content: 'test, keywords' });
      expect(metaService.addTag).toHaveBeenCalledWith({ name: 'author', content: 'Test Author' });
    });

    it('should update Open Graph tags', () => {
      metaService.getTag.and.returnValue(null);
      const config: DocumentHeadConfig = {
        title: 'Test Title',
        description: 'Test Description',
        ogImage: 'https://example.com/image.jpg',
        ogType: 'article'
      };

      service.updateHead(config);

      expect(metaService.addTag).toHaveBeenCalledWith({ property: 'og:title', content: 'Test Title' });
      expect(metaService.addTag).toHaveBeenCalledWith({ property: 'og:description', content: 'Test Description' });
      expect(metaService.addTag).toHaveBeenCalledWith({ property: 'og:image', content: 'https://example.com/image.jpg' });
      expect(metaService.addTag).toHaveBeenCalledWith({ property: 'og:type', content: 'article' });
    });

    it('should update Twitter Card tags', () => {
      metaService.getTag.and.returnValue(null);
      const config: DocumentHeadConfig = {
        title: 'Test Title',
        twitterCard: 'summary',
        twitterCreator: '@testcreator'
      };

      service.updateHead(config);

      expect(metaService.addTag).toHaveBeenCalledWith({ name: 'twitter:card', content: 'summary' });
      expect(metaService.addTag).toHaveBeenCalledWith({ name: 'twitter:creator', content: '@testcreator' });
      expect(metaService.addTag).toHaveBeenCalledWith({ name: 'twitter:title', content: 'Test Title' });
    });

    it('should update existing tags when they exist', () => {
      metaService.getTag.and.returnValue({} as HTMLMetaElement);
      const config: DocumentHeadConfig = {
        description: 'Updated description'
      };

      service.updateHead(config);

      expect(metaService.updateTag).toHaveBeenCalledWith({ name: 'description', content: 'Updated description' });
    });

    it('should handle custom tags', () => {
      metaService.getTag.and.returnValue(null);
      const config: DocumentHeadConfig = {
        customTags: [
          { name: 'custom-name', content: 'custom content' },
          { property: 'custom-property', content: 'property content' },
          { httpEquiv: 'X-UA-Compatible', content: 'IE=edge' }
        ]
      };

      service.updateHead(config);

      expect(metaService.addTag).toHaveBeenCalledWith({ name: 'custom-name', content: 'custom content' });
      expect(metaService.addTag).toHaveBeenCalledWith({ property: 'custom-property', content: 'property content' });
      expect(metaService.addTag).toHaveBeenCalledWith({ 'http-equiv': 'X-UA-Compatible', content: 'IE=edge' });
    });
  });

  describe('removeTag', () => {
    it('should remove a specific tag', () => {
      service.removeTag('name', 'description');
      expect(metaService.removeTag).toHaveBeenCalledWith('name="description"');
    });
  });

  describe('getTitle', () => {
    it('should return current title', () => {
      titleService.getTitle.and.returnValue('Current Title');
      const title = service.getTitle();
      expect(title).toBe('Current Title');
      expect(titleService.getTitle).toHaveBeenCalled();
    });
  });

  describe('getMetaTag', () => {
    it('should return meta tag content when tag exists', () => {
      const mockElement = { getAttribute: jasmine.createSpy('getAttribute').and.returnValue('test content') } as any;
      metaService.getTag.and.returnValue(mockElement);

      const content = service.getMetaTag('name', 'description');

      expect(content).toBe('test content');
      expect(metaService.getTag).toHaveBeenCalledWith('name="description"');
    });

    it('should return null when tag does not exist', () => {
      metaService.getTag.and.returnValue(null);

      const content = service.getMetaTag('name', 'description');

      expect(content).toBeNull();
    });
  });

  describe('default configuration', () => {
    it('should apply default values when not provided', () => {
      metaService.getTag.and.returnValue(null);
      const config: DocumentHeadConfig = {
        title: 'Test Title'
      };

      service.updateHead(config);

      // Should use default values
      expect(metaService.addTag).toHaveBeenCalledWith({ property: 'og:site_name', content: 'SocialVariant' });
      expect(metaService.addTag).toHaveBeenCalledWith({ property: 'og:locale', content: 'en_US' });
      expect(metaService.addTag).toHaveBeenCalledWith({ name: 'twitter:card', content: 'summary_large_image' });
      expect(metaService.addTag).toHaveBeenCalledWith({ name: 'author', content: 'SocialVariant Team' });
    });
  });
});
