import { Component, OnInit } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// NG-ZORRO modules

import { ElasticsearchService } from '../services/elasticsearch.service';
import { FormBuilder, FormGroup } from '@angular/forms';

import { NzMessageService } from 'ng-zorro-antd/message';
import { SharedUiModule } from '../shared/shared-ui.module';
// import { SharedUiModule } from '../shared/shared-ui.module';

// Make sure NzFormModule is imported in your module file, e.g., elasticsearch-visualizer.module.ts or app.module.ts
interface FilterItem {
    field: string;
    operator: string;
    value: any;
    type: string;
  }





// Component class definition
@Component({
  selector: 'app-elasticsearch-visualizer',
  templateUrl: './elasticsearch-visualizer.component.html',
  styleUrls: ['./elasticsearch-visualizer.component.scss'],
  standalone: true,
  imports: [
    SharedUiModule,
  
  ],
})
export class ElasticsearchVisualizerComponent implements OnInit {
  selectedIndex: string = '';
  documents: any[] = [];
  loading: boolean = false;
  searchQuery: string = '';
  searchSuggestions: string[] = [];
  filters: FilterItem[] = [];
  showAdvancedFilters: boolean = false;

  // Modal states
  isModalVisible: boolean = false;
  isViewModalVisible: boolean = false;
  editingDocument: any = null;
  viewingDocument: any = null;
  formData: any = {};
  modalTitle: string = '';

  // Statistics
  totalDocuments: number = 0;
  filteredDocuments: number = 0;
  queryTime: number = 0;
  activeFilters: number = 0;

  // Pagination
  currentPage: number = 1;
  pageSize: number = 10;
  documentForm!: FormGroup;
  indexes = [
    { key: 'saisine', name: 'Saisine (prequest.dev.saisine_type)', index: 'prequest.dev.saisine_type' },
    { key: 'saisine_backlog', name: 'Saisine Backlog (prequest.dev.saisine_backlog_type)', index: 'prequest.dev.saisine_backlog_type' },
    { key: 'meeting', name: 'Meeting (prequest.dev.meeting_type)', index: 'prequest.dev.meeting_type' },
    { key: 'decision', name: 'Decision (prequest.dev.decision_type)', index: 'prequest.dev.decision_type' },
    { key: 'fdr', name: 'FDR (prequest.dev.fdr_type)', index: 'prequest.dev.fdr_type' }
  ];

  fieldMappings = {
    saisine: [
      { key: 'title', label: 'Title', type: 'text', required: true, options: [] },
      { key: 'description', label: 'Description', type: 'textarea', required: true, options: [] },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed', 'cancelled'], required: true },
      { key: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'urgent'], required: true },
      { key: 'created_date', label: 'Created Date', type: 'date', required: true, options: [] },
      { key: 'assigned_to', label: 'Assigned To', type: 'text', required: false, options: [] },
      { key: 'category', label: 'Category', type: 'text', required: false, options: [] }
    ],
    saisine_backlog: [
      { key: 'backlog_id', label: 'Backlog ID', type: 'text', required: true, options: [] },
      { key: 'saisine_id', label: 'Saisine ID', type: 'text', required: true, options: [] },
      { key: 'reason', label: 'Reason', type: 'textarea', required: true, options: [] },
      { key: 'created_date', label: 'Created Date', type: 'date', required: true, options: [] },
      { key: 'resolved_date', label: 'Resolved Date', type: 'date', required: false, options: [] }
    ],
    meeting: [
      { key: 'meeting_title', label: 'Meeting Title', type: 'text', required: true, options: [] },
      { key: 'meeting_date', label: 'Meeting Date', type: 'date', required: true, options: [] },
      { key: 'participants', label: 'Participants', type: 'textarea', required: true, options: [] },
      { key: 'agenda', label: 'Agenda', type: 'textarea', required: true, options: [] },
      { key: 'location', label: 'Location', type: 'text', required: false, options: [] },
      { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'in_progress', 'completed', 'cancelled'], required: true }
    ],
    decision: [
      { key: 'decision_title', label: 'Decision Title', type: 'text', required: true, options: [] },
      { key: 'decision_text', label: 'Decision Text', type: 'textarea', required: true, options: [] },
      { key: 'decision_date', label: 'Decision Date', type: 'date', required: true, options: [] },
      { key: 'decision_maker', label: 'Decision Maker', type: 'text', required: true, options: [] },
      { key: 'impact', label: 'Impact', type: 'select', options: ['low', 'medium', 'high'], required: true },
      { key: 'related_saisine', label: 'Related Saisine', type: 'text', required: false, options: [] }
    ],
    fdr: [
      { key: 'fdr_number', label: 'FDR Number', type: 'text', required: true, options: [] },
      { key: 'fdr_title', label: 'FDR Title', type: 'text', required: true, options: [] },
      { key: 'fdr_content', label: 'FDR Content', type: 'textarea', required: true, options: [] },
      { key: 'creation_date', label: 'Creation Date', type: 'date', required: true, options: [] },
      { key: 'last_updated', label: 'Last Updated', type: 'date', required: false, options: [] },
      { key: 'version', label: 'Version', type: 'text', required: true, options: [] },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'review', 'approved', 'archived'], required: true }
    ]
  };

  constructor(
    private elasticsearchService: ElasticsearchService,
    private message: NzMessageService,
    private fb: FormBuilder
  ) {}



  ngOnInit() {
    this.documentForm = this.fb.group({});
    this.addFilter(); // Add initial empty filter
  }

  onIndexChange() {
    if (this.selectedIndex) {
      this.loadData();
      this.clearFilters();
    }
    this.resetForm();
  }

  resetForm() {
    this.formData = {};
    this.editingDocument = null;
    // If you have a FormGroup, reset it here as well
    // this.documentForm?.reset();
  }

  loadData() {
    if (!this.selectedIndex) return;

    this.loading = true;
    const indexName = this.indexes.find(i => i.key === this.selectedIndex)?.index;
    const startTime = Date.now();
    
    this.elasticsearchService.searchDocuments(indexName!, '', 0, 10).subscribe({
      next: (response) => {
        this.documents = response.hits.hits;
        this.totalDocuments = typeof response.hits.total === 'object' ? response.hits.total.value : response.hits.total;
        this.filteredDocuments = this.documents.length;
        this.queryTime = Date.now() - startTime;
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Failed to load documents: ' + error.message);
        this.loading = false;
      }
    });
  }

  onSearchInput(value: string) {
    if (value.length > 2) {
      this.generateSearchSuggestions(value);
    }
  }
// Add this method to your component class
getFieldOptions(fieldKey: string): string[] {
  // Replace this logic with your actual field options retrieval logic
  const fields = this.getFieldsForIndex(this.selectedIndex) || [];
  const field = fields.find(f => f.key === fieldKey);
  return field && field.options ? field.options : [];
}
  // Add this method to your component class
getSortFn(fieldKey: string): ((a: any, b: any) => number) | null {
  return (a: any, b: any) => {
    const aValue = a._source && a._source[fieldKey] !== undefined ? a._source[fieldKey] : '';
    const bValue = b._source && b._source[fieldKey] !== undefined ? b._source[fieldKey] : '';
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return -1;
    if (bValue == null) return 1;
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue;
    }
    return String(aValue).localeCompare(String(bValue));
  };
}
  generateSearchSuggestions(query: string) {
    const fields = this.getFieldsForIndex(this.selectedIndex);
    const suggestions = [];
    
    // Field-based suggestions
    fields.forEach(field => {
      if (field.key.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(`${field.key}:${query}`);
      }
    });
    
    // Operator suggestions
    if (query.includes(':')) {
      const [field, value] = query.split(':');
      if (value) {
        suggestions.push(`${field}:*${value}*`);
        suggestions.push(`${field}:"${value}"`);
      }
    }
    
    // Boolean query suggestions
    suggestions.push(`${query} AND status:pending`);
    suggestions.push(`${query} OR priority:high`);
    suggestions.push(`NOT ${query}`);
    
    this.searchSuggestions = suggestions.slice(0, 10);
  }

  onSearchSelect(value: string) {
    this.searchQuery = value;
    this.executeSearch();
  }

  executeSearch() {
    if (!this.selectedIndex) return;

    this.loading = true;
    const indexName = this.indexes.find(i => i.key === this.selectedIndex)?.index;
    const startTime = Date.now();
    
    this.elasticsearchService.searchDocuments(indexName!, this.searchQuery).subscribe({
      next: (response) => {
        this.documents = response.hits.hits;
        this.filteredDocuments = this.documents.length;
        this.queryTime = Date.now() - startTime;
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Search failed: ' + error.message);
        this.loading = false;
      }
    });
  }

  // clearSearch() with suggestions reset is removed to resolve duplicate implementation error.

  // Filter methods
  addFilter() {
    this.filters.push({
      field: '',
      operator: 'equals',
      value: '',
      type: 'text'
    });
  }

  getFieldType(fieldKey: string): string {
    const fields = this.getFieldsForIndex(this.selectedIndex);
    const field = fields.find(f => f.key === fieldKey);
    return field ? field.type : '';
  }

  public formatDate(dateValue: any): string {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;
    return date.toLocaleString();
  }

  removeFilter(index: number) {
    this.filters.splice(index, 1);
    this.updateActiveFilters();
  }

  // Returns the fields to display in the table for the selected index
getDisplayFields(selectedIndex: string): any[] {
  // If you have a fields config per index, use it here. Example:
  // return this.indexFields[selectedIndex]?.filter(f => f.display !== false) || [];
  // For now, fallback to all fields if not configured:
  if (!selectedIndex || !this.getFieldsForIndex) {
    return [];
  }
  return this.getFieldsForIndex(selectedIndex) || [];
}

  applyFilters() {
    if (!this.selectedIndex) return;

    const query = this.buildFilterQuery();
    this.loading = true;
    const indexName = this.indexes.find(i => i.key === this.selectedIndex)?.index;
    const startTime = Date.now();

    this.elasticsearchService.searchWithFilters(indexName!, query).subscribe({
      next: (response) => {
        this.documents = response.hits.hits;
        this.filteredDocuments = this.documents.length;
        this.queryTime = Date.now() - startTime;
        this.loading = false;
        this.updateActiveFilters();
      },
      error: (error) => {
        this.message.error('Filter failed: ' + error.message);
        this.loading = false;
      }
    });
  }
  formatFieldValue(value: any, type: string): string {
    if (value == null) return '';
    switch (type) {
      case 'date':
        return this.formatDate(value);
      case 'select':
        return value;
      case 'textarea':
        return ('' + value).replace(/\n/g, '<br>');
      default:
        return ('' + value);
    }
  }

  clearFilters() {
    this.filters = [];
    this.addFilter();
    this.updateActiveFilters();
    this.loadData();
  }

  buildFilterQuery() {
    const validFilters = this.filters.filter(f => f.field && f.operator && (f.value || f.operator === 'exists' || f.operator === 'not_exists'));
    
    if (validFilters.length === 0) {
      return { match_all: {} };
    }

    const mustClauses = validFilters.map(filter => {
      switch (filter.operator) {
        case 'equals':
          return { term: { [filter.field]: filter.value } };
        case 'contains':
          return { match: { [filter.field]: filter.value } };
        case 'starts_with':
          return { prefix: { [filter.field]: filter.value } };
        case 'range':
          return { range: { [filter.field]: { gte: filter.value } } };
        case 'exists':
          return { exists: { field: filter.field } };
        case 'not_exists':
          return { bool: { must_not: { exists: { field: filter.field } } } };
        default:
          return { match: { [filter.field]: filter.value } };
      }
    });

    return {
      bool: {
        must: mustClauses
      }
    };
  }

  updateActiveFilters() {
    this.activeFilters = this.filters.filter(f => f.field && f.operator && (f.value || f.operator === 'exists' || f.operator === 'not_exists')).length;
  }

  // Modal methods
  showCreateModal() {
    this.modalTitle = 'Create New Document';
    this.editingDocument = null;
    this.formData = {};
    this.isModalVisible = true;
  }

  editDocument(doc: any) {
    this.modalTitle = 'Edit Document';
    this.editingDocument = doc;
    this.formData = { ...doc._source };
    this.isModalVisible = true;
  }

  viewDocument(doc: any) {
    this.viewingDocument = doc;
    this.isViewModalVisible = true;
  }

  closeModal() {
    this.isModalVisible = false;
    this.resetForm();
  }

  closeViewModal() {
    this.isViewModalVisible = false;
    this.viewingDocument = null;
  }

 saveDocument() {
    if (!this.selectedIndex) return;
    
    const indexName = this.indexes.find(i => i.key === this.selectedIndex)?.index;
    
    if (this.editingDocument) {
      this.elasticsearchService.updateDocument(indexName!, this.editingDocument._id, this.formData).subscribe({
        next: (response) => {
          this.message.success('Document updated successfully');
          this.loadData();
          this.closeModal();
        },
        error: (error) => {
          this.message.error('Failed to update document: ' + error.message);
        }
      });
    } else {
      this.elasticsearchService.createDocument(indexName!, this.formData).subscribe({
        next: (response) => {
          this.message.success('Document created successfully');
          this.loadData();
          this.closeModal();
        },
        error: (error) => {
          this.message.error('Failed to create document: ' + error.message);
        }
      });
    }
  }

  deleteDocument(doc: any) {
    if (!this.selectedIndex) return;
    
    const indexName = this.indexes.find(i => i.key === this.selectedIndex)?.index;
    
    this.elasticsearchService.deleteDocument(indexName!, doc._id).subscribe({
      next: (response) => {
        this.message.success('Document deleted successfully');
        this.loadData();
      },
      error: (error) => {
        this.message.error('Failed to delete document: ' + error.message);
      }
    });
  }

  // Removed duplicate closeModal() implementation to fix duplicate function error.

  // Search functionality
  onSearch() {
    if (!this.selectedIndex) return;
    
    const indexName = this.indexes.find(i => i.key === this.selectedIndex)?.index;
    
    if (!this.searchQuery.trim()) {
      this.loadData();
      return;
    }

    this.loading = true;
    this.elasticsearchService.searchDocuments(indexName!, this.searchQuery).subscribe({
      next: (response) => {
        this.documents = response.hits.hits;
        this.totalDocuments = response.hits.total.value;
        this.loading = false;
      },
      error: (error) => {
        this.message.error('Search failed: ' + error.message);
        this.loading = false;
      }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadData();
  }

  // Pagination
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadData();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.loadData();
  }

  // Utility methods
  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  getDocumentKeys(doc: any): string[] {
    return Object.keys(doc._source || {});
  }

  getDocumentValue(doc: any, key: string): any {
    return doc._source[key];
  }

  // Export functionality
  exportData() {
    if (!this.documents.length) return;
    
    const data = this.documents.map(doc => doc._source);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedIndex}_documents.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Returns the field mapping for the selected index key
  getFieldsForIndex(indexKey: string) {
    switch (indexKey) {
      case 'saisine':
        return this.fieldMappings.saisine;
      case 'saisine_backlog':
        return this.fieldMappings.saisine_backlog;
      case 'meeting':
        return this.fieldMappings.meeting;
      case 'decision':
        return this.fieldMappings.decision;
      case 'fdr':
        return this.fieldMappings.fdr;
      default:
        return [];
    }
  }

  // Refresh data
  refreshData() {
    this.loadData();
  }

  // Utility: Get color for select/tag fields
  getTagColor(value: string): string {
    if (!value) return 'default';
    const colorMap: { [key: string]: string } = {
      pending: 'orange',
      in_progress: 'blue',
      completed: 'green',
      cancelled: 'red',
      scheduled: 'blue',
      draft: 'orange',
      review: 'purple',
      approved: 'green',
      archived: 'gray',
      high: 'red',
      medium: 'gold',
      low: 'blue',
      urgent: 'volcano'
    };
    return colorMap[value] || 'default';
  }
}
