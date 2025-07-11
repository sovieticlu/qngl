import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

// Import the SharedUIModule if not already imported
import { SharedUiModule } from '../shared/shared-ui.module';
import { CommonModule } from '@angular/common';
// Import the BookSearchService from the service file
import { BookSearchService } from '../services/elasticsearch-filter.service';
import { NzPageHeaderComponent } from "ng-zorro-antd/page-header";
import { NzBreadCrumbComponent } from "ng-zorro-antd/breadcrumb";
import { NzSpaceComponent } from "ng-zorro-antd/space";
import { NzBadgeComponent } from "ng-zorro-antd/badge";
import { NzTabsComponent } from "ng-zorro-antd/tabs";
import { NzTabComponent } from "ng-zorro-antd/tabs";
import { NzListComponent } from "ng-zorro-antd/list";
import { NzListItemComponent, NzListItemMetaComponent } from "ng-zorro-antd/list";
import { Observable, of } from 'rxjs';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
// Remove unused NzGridModule and NzIconModule imports if present
import { NzSliderValue } from 'ng-zorro-antd/slider';
@Component({
  selector: 'app-elasticsearch-filter',
  templateUrl: './elasticsearch-filter.component.html',
  
  //styleUrls: ['./elasticsearch-filter.component.scss'],
  providers: [BookSearchService],
  imports: [CommonModule,NzPageHeaderComponent, NzBreadCrumbComponent, SharedUiModule, NzSpaceComponent, NzBadgeComponent, NzTabsComponent, NzTabComponent, NzListComponent, NzListItemComponent, NzListItemMetaComponent, NzPopoverModule]
})
export class ElasticsearchFilterComponent implements OnInit {
  filterForm!: FormGroup;
  aggregations: any = {};
  books: any[] = [];
  totalCount = 0;
  loading = false;
 
  selectedTopics: string[] = [];
  selectedAuthors: string[] = [];
  minRating = 0;
  priceRange: [number, number] = [0, 100];
  isCollapsed = false;
  presetOptions: string[] = [];
  filteredPresets: string[] = [];
  suggestions$: Observable<{ value: string }[]> = of([]);
  isMobile = false;
  showDropdown = false;
  showSuggestions = false;
  presetSearchValue = '';
  savedPresets: any[] = [];
  isPresetsModalVisible = false;
  currentViewMode = 'grid';
  gridConfig = {};
  paginationConfig = {};
  sortOrderOptions = [
    { label: 'Ascending', value: 'asc' },
    { label: 'Descending', value: 'desc' }
  ];
 

  // Add this property to your component class
  searchResults$: Observable<any> = of({ totalCount: 0, books: [] });
  constructor(private fb: FormBuilder, public bookSearchService: BookSearchService) {
    // Initialize filterForm in the constructor, after fb is available
    this.filterForm = this.fb.group({
      searchTerm: [''],
      topics: [[]],
      authors: [[]],
      language: [''],
      format: [''],
      publisher: [''],
      saisine_type: [''],
      saisine_backlog_type: [''],
      meeting_type: [''],
      decision_type: [''],
      fdr_type: [''],
      sortBy: ['relevance'],
      sortOrder: ['asc'],
      priceRange: [[0, 100]],
      dateRange: [{ start: '', end: '' }],
      rating: [0]
    });
  }

  ngOnInit() {
    this.loadAggregations();
    this.filterForm.valueChanges.subscribe(() => {
      this.onFilter();
    });
    this.onFilter();
    this.setupSuggestions();
  }

  loadAggregations() {
    this.aggregations = this.bookSearchService['generateAggregations'](this.bookSearchService['mockBooks']);
  }

  onFilter() {
    this.loading = true;
    this.bookSearchService.search(this.filterForm.value).subscribe(result => {
      this.books = result.books;
      this.totalCount = result.totalCount;
      this.loading = false;
    });
  }

  setupSuggestions() {
    this.suggestions$ = new Observable(observer => {
      this.filterForm.get('searchTerm')?.valueChanges.subscribe((query: string) => {
        if (query && query.length > 1) {
          this.bookSearchService.getSuggestions(query).subscribe(suggestions => {
            observer.next(suggestions.map(s => ({ value: s })));
          });
        } else {
          observer.next([]);
        }
      });
    });
  }
  onCollapsedChange(collapsed: boolean): void {
    this.isCollapsed = collapsed;
  }
  
  hasSearched: boolean = false;
  ratingTooltips: string[] = [
    'Terrible',
    'Bad',
    'Normal',
    'Good',
    'Wonderful'
  ];
priceMarks = {
  0: '£0',
  20: '£20',
  40: '£40',
  60: '£60',
  80: '£80',
  100: '£100'
};
  priceFormatter = (value: number): string => `£${value}`;
  quickSearch(term: string): void {
    this.filterForm.patchValue({ searchTerm: term });
    this.onFilter();
  }
  selectSuggestion(event: any): void {
    this.filterForm.patchValue({ searchTerm: event });
    this.onFilter();
  }
  performSearch(): void {
    // Implement your search logic here, or leave empty to avoid errors
  }
  onPriceRangeChange(range: NzSliderValue) {
    if (Array.isArray(range) && range.length === 2) {
        this.priceRange = range as [number, number];
        // ... any other logic
    }
    this.onFilter();
}
  onRatingChange(event: number): void {
    this.minRating = event;
    this.filterForm.patchValue({ rating: event });
    this.onFilter();
  }
  onTopicsChange(event: any): void {
    this.selectedTopics = event;
    this.filterForm.patchValue({ topics: event });
    this.onFilter();
  }
  onAuthorsChange(event: any): void {
    this.selectedAuthors = event;
    this.filterForm.patchValue({ authors: event });
    this.onFilter();
  }
  removeTopicFilter(topic: string): void {
    this.selectedTopics = this.selectedTopics.filter(t => t !== topic);
    this.filterForm.patchValue({ topics: this.selectedTopics });
    this.onFilter();
  }
  removeAuthorFilter(author: string): void {
    this.selectedAuthors = this.selectedAuthors.filter(a => a !== author);
    this.filterForm.patchValue({ authors: this.selectedAuthors });
    this.onFilter();
  }
  clearAllFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      topics: [],
      authors: [],
      language: '',
      format: '',
      publisher: '',
      saisine_type: '',
      saisine_backlog_type: '',
      meeting_type: '',
      decision_type: '',
      fdr_type: '',
      sortBy: 'relevance',
      sortOrder: 'asc',
      priceRange: [0, 100],
      dateRange: { start: '', end: '' },
      rating: 0
    });
    this.selectedTopics = [];
    this.selectedAuthors = [];
    this.onFilter();
  }
  saveFilterPreset(): void {}
  openPresetsModal(): void { this.isPresetsModalVisible = true; }
  closePresetsModal(): void { this.isPresetsModalVisible = false; }
  loadFilterPreset(preset: any): void {}
  deleteFilterPreset(preset: any): void {}
  toggleFavoritePreset(preset: any): void {}
  filterPresets(event: any): void {}
  onInputChange(event: any): void {}
  hideSuggestions(): void { this.showSuggestions = false; }
  selectOption(option: any): void { this.presetSearchValue = option; this.showSuggestions = false; }
  suggestAlternatives(): void {}
  setViewMode(mode: string): void { this.currentViewMode = mode; }
  openBookDetails(book: any): void {}
  editBook(book: any): void {}
  addToWishlist(book: any): void {}
  shareBook(book: any): void {}
  reportBook(book: any): void {}
  searchByAuthor(author: string): void { this.filterForm.patchValue({ authors: [author] }); this.onFilter(); }
  searchByPublisher(publisher: string): void { this.filterForm.patchValue({ publisher }); this.onFilter(); }
  getFormatColor(format: string): string { switch (format) { case 'Hardcover': return 'blue'; case 'Paperback': return 'green'; case 'Digital': return 'purple'; default: return 'default'; } }
  viewBookDetails(book: any): void {}
  deleteBook(book: any): void {}
  hasActiveFilters(): boolean { const value = this.filterForm.value; return !!(value.searchTerm || value.topics.length || value.authors.length || value.language || value.format || value.publisher || value.saisine_type || value.saisine_backlog_type || value.meeting_type || value.decision_type || value.fdr_type || value.rating > 0 || value.priceRange[0] > 0 || value.priceRange[1] < 100); }
  getSaisineTypesArray(): any[] { 
    const aggs = this.aggregations.saisine_types || {}; 
    return Object.keys(aggs).map((key: string) => ({ key, count: aggs[key] })); 
  }
  getSaisineBacklogTypesArray(): any[] { 
    const aggs = this.aggregations.saisine_backlog_types || {}; 
    return Object.keys(aggs).map((key: string) => ({ key, count: aggs[key] })); 
  }
  getMeetingTypesArray(): any[] { 
    const aggs = this.aggregations.meeting_types || {}; 
    return Object.keys(aggs).map((key: string) => ({ key, count: aggs[key] })); 
  }
  getDecisionTypesArray(): any[] { 
    const aggs = this.aggregations.decision_types || {}; 
    return Object.keys(aggs).map((key: string) => ({ key, count: aggs[key] })); 
  }
  getFdrTypesArray(): any[] { 
    const aggs = this.aggregations.fdr_types || {}; 
    return Object.keys(aggs).map((key: string) => ({ key, count: aggs[key] })); 
  }
  getTopicsCheckboxOptions(topics: any): any[] { 
    if (!topics) return []; 
    return Object.keys(topics).map((key: string) => ({ value: key, label: key, count: topics[key] })); 
  }
  getAuthorsCheckboxOptions(authors: any): any[] { 
    if (!authors) return []; 
    return Object.keys(authors).map((key: string) => ({ value: key, label: key, count: authors[key] })); 
  }
  getFormatSegmentedOptions(formats: any): any[] { 
    if (!formats) return []; 
    return Object.keys(formats).map((key: string) => ({ label: key, value: key })); 
  }
  getPublishersArray(publishers: any): any[] { 
    if (!publishers) return []; 
    return Object.keys(publishers).map((key: string) => ({ key, count: publishers[key] })); 
  }
  publisherFilterOption = (inputValue: string, option: any): boolean => { return option.nzLabel.toLowerCase().includes(inputValue.toLowerCase()); };
  getRecentPresets(): any[] { return []; }
  getFavoritePresets(): any[] { return []; }

  toggleArrayValue(field: string, value: string) {
    const arr = this.filterForm.get(field)?.value || [];
    if (arr.includes(value)) {
      this.filterForm.get(field)?.setValue(arr.filter((v: string) => v !== value));
    } else {
      this.filterForm.get(field)?.setValue([...arr, value]);
    }
  }

  getBookRating(book: any): number {
    return typeof book.rating === 'number' ? book.rating : 0;
  }
}
