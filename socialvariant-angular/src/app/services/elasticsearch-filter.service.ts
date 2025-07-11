import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Subject, BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';

// Mock Service
// Interfaces
interface Book {
    id: string;
    title: string;
    'detailed description': string;
    isbn: string;
    price_gbp: number;
    audience: string;
    authors: string[];
    topics: string[];
    'publication date': string;
    rating?: number;
    pages?: number;
    language?: string;
    publisher?: string;
    format?: string;
    // New advanced filter fields
    saisine_type?: string;
    saisine_backlog_type?: string;
    meeting_type?: string;
    decision_type?: string;
    fdr_type?: string;
  }
  
  interface SearchFilters {
    searchTerm: string;
    topics: string[];
    priceRange: { min: number; max: number };
    authors: string[];
    dateRange: { start: string; end: string };
    rating: number;
    language: string;
    format: string;
    publisher: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    // New advanced filters
    saisine_type: string;
    saisine_backlog_type: string;
    meeting_type: string;
    decision_type: string;
    fdr_type: string;
  }

export class BookSearchService {
    private mockBooks: Book[] = [
      {
        id: "27",
        title: "Deep Inside osCommerce: The Cookbook",
        "detailed description": "osCommerce has been around since March 2000. At present there are over 10,000 live, registered osCommerce sites, and about 100,000 registered community members. Apart from providing ready-made solutions to problems, as well as a huge repository of information, the osCommerce community is a living entity with which we can all interact.",
        isbn: "1847190901",
        price_gbp: 37,
        audience: "This book is for people who are already familiar with osCommerce. It presumes a working knowledge of PHP and HTML, as well as basic understanding of phpMyAdmin for database inserts.",
        authors: ["Monika Mathé"],
        topics: ["Open Source", "e-Commerce", "Content Management (CMS)", "Cookbooks"],
        "publication date": "2006-10-01",
        rating: 4.2,
        pages: 312,
        language: "English",
        publisher: "Packt Publishing",
        format: "Paperback",
        saisine_type: "Standard",
        saisine_backlog_type: "Active",
        meeting_type: "Committee",
        decision_type: "Approved",
        fdr_type: "Type A"
      },
      {
        id: "28",
        title: "Advanced React Development Patterns",
        "detailed description": "Master advanced React patterns and techniques used in production applications. Learn about render props, higher-order components, compound components, and the latest hooks patterns for building scalable applications.",
        isbn: "9781234567890",
        price_gbp: 45,
        audience: "Experienced React developers looking to advance their skills",
        authors: ["Sarah Johnson", "Mike Chen"],
        topics: ["React", "JavaScript", "Frontend", "Web Development", "Patterns"],
        "publication date": "2023-03-15",
        rating: 4.8,
        pages: 425,
        language: "English",
        publisher: "Tech Books",
        format: "Hardcover",
        saisine_type: "Priority",
        saisine_backlog_type: "Pending",
        meeting_type: "Board",
        decision_type: "Under Review",
        fdr_type: "Type B"
      },
      {
        id: "29",
        title: "Elasticsearch for Modern Applications",
        "detailed description": "Comprehensive guide to building search applications with Elasticsearch. Covers indexing, querying, aggregations, and performance optimization for enterprise-scale applications.",
        isbn: "9780987654321",
        price_gbp: 52,
        audience: "Developers and architects working with search applications",
        authors: ["David Rodriguez"],
        topics: ["Elasticsearch", "Search", "Backend", "Database", "Performance"],
        "publication date": "2023-08-20",
        rating: 4.5,
        pages: 380,
        language: "English",
        publisher: "Data Press",
        format: "Digital",
        saisine_type: "Urgent",
        saisine_backlog_type: "Completed",
        meeting_type: "Technical",
        decision_type: "Rejected",
        fdr_type: "Type C"
      },
      {
        id: "30",
        title: "TypeScript Best Practices",
        "detailed description": "Learn TypeScript from basics to advanced concepts. Covers type safety, generics, decorators, and integration with popular frameworks like Angular and React.",
        isbn: "9781122334455",
        price_gbp: 39,
        audience: "JavaScript developers transitioning to TypeScript",
        authors: ["Emily Watson"],
        topics: ["TypeScript", "JavaScript", "Frontend", "Programming"],
        "publication date": "2023-11-10",
        rating: 4.6,
        pages: 298,
        language: "English",
        publisher: "Code Masters",
        format: "Paperback",
        saisine_type: "Standard",
        saisine_backlog_type: "Active",
        meeting_type: "Committee",
        decision_type: "Approved",
        fdr_type: "Type A"
      },
      {
        id: "31",
        title: "Angular Architecture Patterns",
        "detailed description": "Explore advanced Angular architecture patterns for large-scale applications. Learn about state management, micro-frontends, and enterprise-grade solutions.",
        isbn: "9789876543210",
        price_gbp: 48,
        audience: "Senior Angular developers and architects",
        authors: ["John Smith", "Lisa Brown"],
        topics: ["Angular", "Architecture", "Enterprise", "Frontend"],
        "publication date": "2023-12-05",
        rating: 4.7,
        pages: 456,
        language: "English",
        publisher: "Angular Press",
        format: "Hardcover",
        saisine_type: "Priority",
        saisine_backlog_type: "Pending",
        meeting_type: "Board",
        decision_type: "Under Review",
        fdr_type: "Type B"
      },
      {
        id: "32",
        title: "Python Machine Learning Cookbook",
        "detailed description": "Practical recipes for implementing machine learning algorithms in Python. Covers scikit-learn, TensorFlow, and PyTorch with real-world examples.",
        isbn: "9781357924680",
        price_gbp: 55,
        audience: "Data scientists and Python developers",
        authors: ["Alex Kumar", "Maria Garcia"],
        topics: ["Python", "Machine Learning", "Data Science", "AI"],
        "publication date": "2023-09-18",
        rating: 4.4,
        pages: 520,
        language: "English",
        publisher: "ML Publications",
        format: "Digital",
        saisine_type: "Urgent",
        saisine_backlog_type: "Completed",
        meeting_type: "Technical",
        decision_type: "Approved",
        fdr_type: "Type C"
      }
    ];
  
    search(filters: Partial<SearchFilters>): Observable<{ books: Book[]; totalCount: number; aggregations: any }> {
      return new Observable(observer => {
        setTimeout(() => {
          let filteredBooks = [...this.mockBooks];
  
          // Apply search term filter
          if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            filteredBooks = filteredBooks.filter(book =>
              book.title.toLowerCase().includes(term) ||
              book['detailed description'].toLowerCase().includes(term) ||
              book.authors.some(author => author.toLowerCase().includes(term)) ||
              book.topics.some(topic => topic.toLowerCase().includes(term))
            );
          }
  
          // Apply topic filters
          if (filters.topics && filters.topics.length > 0) {
            filteredBooks = filteredBooks.filter(book =>
              filters.topics!.some(topic => book.topics.includes(topic))
            );
          }
  
          // Apply author filters
          if (filters.authors && filters.authors.length > 0) {
            filteredBooks = filteredBooks.filter(book =>
              filters.authors!.some(author => book.authors.includes(author))
            );
          }
  
          // Apply price range filter
          if (filters.priceRange && filters.priceRange.min !== undefined && filters.priceRange.max !== undefined) {
            filteredBooks = filteredBooks.filter(book =>
              book.price_gbp >= filters.priceRange!.min && book.price_gbp <= filters.priceRange!.max
            );
          }
  
          // Apply rating filter
          if (filters.rating !== undefined && filters.rating > 0) {
            filteredBooks = filteredBooks.filter(book =>
              (book.rating ?? 0) >= filters.rating!
            );
          }
  
          // Apply language filter
          if (filters.language) {
            filteredBooks = filteredBooks.filter(book =>
              book.language === filters.language
            );
          }
  
          // Apply format filter
          if (filters.format) {
            filteredBooks = filteredBooks.filter(book =>
              book.format === filters.format
            );
          }
  
          // Apply publisher filter
          if (filters.publisher) {
            filteredBooks = filteredBooks.filter(book =>
              book.publisher === filters.publisher
            );
          }
  
          // Apply advanced filters
          if (filters.saisine_type) {
            filteredBooks = filteredBooks.filter(book =>
              book.saisine_type === filters.saisine_type
            );
          }
  
          if (filters.saisine_backlog_type) {
            filteredBooks = filteredBooks.filter(book =>
              book.saisine_backlog_type === filters.saisine_backlog_type
            );
          }
  
          if (filters.meeting_type) {
            filteredBooks = filteredBooks.filter(book =>
              book.meeting_type === filters.meeting_type
            );
          }
  
          if (filters.decision_type) {
            filteredBooks = filteredBooks.filter(book =>
              book.decision_type === filters.decision_type
            );
          }
  
          if (filters.fdr_type) {
            filteredBooks = filteredBooks.filter(book =>
              book.fdr_type === filters.fdr_type
            );
          }
  
          // Apply date range filter
          if (
            filters.dateRange &&
            typeof filters.dateRange.start !== 'undefined' &&
            typeof filters.dateRange.end !== 'undefined'
          ) {
            filteredBooks = filteredBooks.filter(book => {
              const bookDate = new Date(book['publication date']);
              const startDate = new Date(filters.dateRange!.start);
              const endDate = new Date(filters.dateRange!.end);
              return bookDate >= startDate && bookDate <= endDate;
            });
          }
  
          // Apply sorting
          if (filters.sortBy) {
            filteredBooks.sort((a, b) => {
              let aValue, bValue;
              
              switch (filters.sortBy) {
                case 'title':
                  aValue = a.title.toLowerCase();
                  bValue = b.title.toLowerCase();
                  break;
                case 'price':
                  aValue = a.price_gbp;
                  bValue = b.price_gbp;
                  break;
                case 'rating':
                  aValue = a.rating || 0;
                  bValue = b.rating || 0;
                  break;
                case 'date':
                  aValue = new Date(a['publication date']).getTime();
                  bValue = new Date(b['publication date']).getTime();
                  break;
                default:
                  aValue = a.title.toLowerCase();
                  bValue = b.title.toLowerCase();
              }
  
              if (filters.sortOrder === 'desc') {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
              } else {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
              }
            });
          }
  
          // Generate aggregations
          const aggregations = this.generateAggregations(this.mockBooks);
  
          observer.next({ books: filteredBooks, totalCount: filteredBooks.length, aggregations });
          observer.complete();
        }, 300);
      });
    }
  
    private generateAggregations(books: Book[]) {
      const topics: { [key: string]: number } = {};
      const authors: { [key: string]: number } = {};
      const publishers: { [key: string]: number } = {};
      const languages: { [key: string]: number } = {};
      const formats: { [key: string]: number } = {};
      const saisine_types: { [key: string]: number } = {};
      const saisine_backlog_types: { [key: string]: number } = {};
      const meeting_types: { [key: string]: number } = {};
      const decision_types: { [key: string]: number } = {};
      const fdr_types: { [key: string]: number } = {};
  
      books.forEach(book => {
        book.topics.forEach(topic => {
          topics[topic] = (topics[topic] || 0) + 1;
        });
  
        book.authors.forEach(author => {
          authors[author] = (authors[author] || 0) + 1;
        });
  
        if (book.publisher) {
          publishers[book.publisher] = (publishers[book.publisher] || 0) + 1;
        }
        if (book.language) {
          languages[book.language] = (languages[book.language] || 0) + 1;
        }
        if (book.format) {
          formats[book.format] = (formats[book.format] || 0) + 1;
        }
  
        // Advanced filters aggregations
        if (book.saisine_type) {
          saisine_types[book.saisine_type] = (saisine_types[book.saisine_type] || 0) + 1;
        }
        if (book.saisine_backlog_type) {
          saisine_backlog_types[book.saisine_backlog_type] = (saisine_backlog_types[book.saisine_backlog_type] || 0) + 1;
        }
        if (book.meeting_type) {
          meeting_types[book.meeting_type] = (meeting_types[book.meeting_type] || 0) + 1;
        }
        if (book.decision_type) {
          decision_types[book.decision_type] = (decision_types[book.decision_type] || 0) + 1;
        }
        if (book.fdr_type) {
          fdr_types[book.fdr_type] = (fdr_types[book.fdr_type] || 0) + 1;
        }
      });
  
      return { 
        topics, 
        authors, 
        publishers, 
        languages, 
        formats,
        saisine_types,
        saisine_backlog_types,
        meeting_types,
        decision_types,
        fdr_types
      };
    }
  
    getSuggestions(query: string): Observable<string[]> {
      return new Observable(observer => {
        setTimeout(() => {
          const suggestions = this.mockBooks
            .filter(book => book.title.toLowerCase().includes(query.toLowerCase()))
            .map(book => book.title)
            .slice(0, 5);
          observer.next(suggestions);
          observer.complete();
        }, 200);
      });
    }
  }
  