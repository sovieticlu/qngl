import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ElasticsearchIndex {
  index: string;
  health: string;
  status: string;
  uuid: string;
  pri: number;
  rep: number;
  'docs.count': number;
  'docs.deleted': number;
  'store.size': string;
  'pri.store.size': string;
}

export interface ElasticsearchMapping {
  [indexName: string]: {
    mappings: {
      properties: {
        [fieldName: string]: {
          type: string;
          format?: string;
          index?: boolean;
          analyzer?: string;
          fields?: any;
        };
      };
    };
  };
}

export interface ElasticsearchDocument {
  _index: string;
  _type?: string;
  _id: string;
  _version?: number;
  _score?: number;
  _source: any;
  found?: boolean;
}

export interface ElasticsearchSearchResponse {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: ElasticsearchDocument[];
  };
  aggregations?: any;
}

export interface ElasticsearchCreateResponse {
  _index: string;
  _type?: string;
  _id: string;
  _version: number;
  result: string;
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface ElasticsearchUpdateResponse {
  _index: string;
  _type?: string;
  _id: string;
  _version: number;
  result: string;
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface ElasticsearchDeleteResponse {
  _index: string;
  _type?: string;
  _id: string;
  _version: number;
  result: string;
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface ElasticsearchError {
  error: {
    type: string;
    reason: string;
    index?: string;
    caused_by?: {
      type: string;
      reason: string;
    };
  };
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {
  private baseUrl = 'http://localhost:9200'; // Default Elasticsearch URL
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Set the Elasticsearch base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }

  /**
   * Set authentication headers if needed
   */
  setAuth(username: string, password: string): void {
    const auth = btoa(`${username}:${password}`);
    this.httpOptions.headers = this.httpOptions.headers.set('Authorization', `Basic ${auth}`);
  }

  /**
   * Get cluster health
   */
  getClusterHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/_cluster/health`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get all indexes
   */
  getIndexes(): Observable<ElasticsearchIndex[]> {
    return this.http.get(`${this.baseUrl}/_cat/indices?format=json&h=index,health,status,uuid,pri,rep,docs.count,docs.deleted,store.size,pri.store.size`, this.httpOptions)
      .pipe(
        map((response: any) => response as ElasticsearchIndex[]),
        catchError(this.handleError)
      );
  }

  /**
   * Get index mapping
   */
  getIndexMapping(indexName: string): Observable<ElasticsearchMapping> {
    return this.http.get(`${this.baseUrl}/${indexName}/_mapping`, this.httpOptions)
      .pipe(
        map((response: any) => response as ElasticsearchMapping),
        catchError(this.handleError)
      );
  }

  /**
   * Get index settings
   */
  getIndexSettings(indexName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${indexName}/_settings`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Create a new index
   */
  createIndex(indexName: string, mapping?: any, settings?: any): Observable<any> {
    const body: any = {};
    if (mapping) body.mappings = mapping;
    if (settings) body.settings = settings;

    return this.http.put(`${this.baseUrl}/${indexName}`, body, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete an index
   */
  deleteIndex(indexName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${indexName}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get documents from an index with pagination
   */
  getDocuments(indexName: string, from: number = 0, size: number = 10): Observable<ElasticsearchSearchResponse> {
    const body = {
      query: {
        match_all: {}
      },
      from: from,
      size: size,
      sort: [
        {
          "_id": {
            "order": "asc"
          }
        }
      ]
    };

    return this.http.post(`${this.baseUrl}/${indexName}/_search`, body, this.httpOptions)
      .pipe(
        map((response: any) => response as ElasticsearchSearchResponse),
        catchError(this.handleError)
      );
  }

  /**
   * Get a specific document by ID
   */
  getDocument(indexName: string, documentId: string): Observable<ElasticsearchDocument> {
    return this.http.get(`${this.baseUrl}/${indexName}/_doc/${documentId}`, this.httpOptions)
      .pipe(
        map((response: any) => response as ElasticsearchDocument),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new document
   */
  createDocument(indexName: string, document: any, documentId?: string): Observable<ElasticsearchCreateResponse> {
    const url = documentId 
      ? `${this.baseUrl}/${indexName}/_doc/${documentId}`
      : `${this.baseUrl}/${indexName}/_doc`;

    const method = documentId ? 'put' : 'post';

    return this.http[method](url, document, this.httpOptions)
      .pipe(
        map((response: any) => response as ElasticsearchCreateResponse),
        catchError(this.handleError)
      );
  }

  /**
   * Update a document
   */
  updateDocument(indexName: string, documentId: string, document: any): Observable<ElasticsearchUpdateResponse> {
    const body = {
      doc: document
    };

    return this.http.post(`${this.baseUrl}/${indexName}/_update/${documentId}`, body, this.httpOptions)
      .pipe(
        map((response: any) => response as ElasticsearchUpdateResponse),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a document
   */
  deleteDocument(indexName: string, documentId: string): Observable<ElasticsearchDeleteResponse> {
    return this.http.delete(`${this.baseUrl}/${indexName}/_doc/${documentId}`, this.httpOptions)
      .pipe(
        map((response: any) => response as ElasticsearchDeleteResponse),
        catchError(this.handleError)
      );
  }

  /**
   * Search documents
   */
  searchDocuments(indexName: string, query: string, from: number = 0, size: number = 10): Observable<ElasticsearchSearchResponse> {
    const body = {
      query: {
        multi_match: {
          query: query,
          fields: ["*"],
          type: "best_fields",
          fuzziness: "AUTO"
        }
      },
      from: from,
      size: size,
      highlight: {
        fields: {
          "*": {}
        }
      }
    };

    return this.http.post(`${this.baseUrl}/${indexName}/_search`, body, this.httpOptions)
      .pipe(
        map((response: any) => response as ElasticsearchSearchResponse),
        catchError(this.handleError)
      );
  }

  /**
   * Advanced search with custom query
   */
  advancedSearch(indexName: string, query: any, from: number = 0, size: number = 10): Observable<ElasticsearchSearchResponse> {
    const body = {
      ...query,
      from: from,
      size: size
    };

    return this.http.post(`${this.baseUrl}/${indexName}/_search`, body, this.httpOptions)
      .pipe(
        map((response: any) => response as ElasticsearchSearchResponse),
        catchError(this.handleError)
      );
  }

  /**
   * Get aggregations
   */
  getAggregations(indexName: string, aggregations: any): Observable<any> {
    const body = {
      size: 0,
      aggs: aggregations
    };

    return this.http.post(`${this.baseUrl}/${indexName}/_search`, body, this.httpOptions)
      .pipe(
        map((response: any) => response.aggregations),
        catchError(this.handleError)
      );
  }

  /**
   * Bulk operations
   */
  bulkOperation(operations: any[]): Observable<any> {
    let body = '';
    operations.forEach(op => {
      body += JSON.stringify(op) + '\n';
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-ndjson',
      'Accept': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/_bulk`, body, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Refresh index
   */
  refreshIndex(indexName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${indexName}/_refresh`, {}, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get index statistics
   */
  getIndexStats(indexName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${indexName}/_stats`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Test connection to Elasticsearch
   */
  testConnection(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get document count for an index
   */
  getDocumentCount(indexName: string): Observable<number> {
    return this.http.get(`${this.baseUrl}/${indexName}/_count`, this.httpOptions)
      .pipe(
        map((response: any) => response.count),
        catchError(this.handleError)
      );
  }

  /**
   * Validate query
   */
  validateQuery(indexName: string, query: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${indexName}/_validate/query`, query, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Explain query
   */
  explainQuery(indexName: string, documentId: string, query: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${indexName}/_explain/${documentId}`, query, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get field capabilities
   */
  getFieldCapabilities(indexName: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${indexName}/_field_caps?fields=*`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Reindex data
   */
  reindex(sourceIndex: string, destIndex: string, query?: any): Observable<any> {
    const body: any = {
      source: {
        index: sourceIndex
      },
      dest: {
        index: destIndex
      }
    };

    if (query) {
      body.source.query = query;
    }

    return this.http.post(`${this.baseUrl}/_reindex`, body, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }
    
  searchWithFilters(index: string, query: any): Observable<any> {
    const url = `http://localhost:9200/${index}/_search`;
    return this.http.post(url, { query });
  }

  /**
   * Error handler
   */
  private handleError(error: any): Observable<never> {
    console.error('Elasticsearch service error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error && error.error.error) {
      const esError = error.error.error as ElasticsearchError['error'];
      errorMessage = esError.reason || esError.type || 'Elasticsearch error';
    } else if (error.message) {
      errorMessage = error.message;
    } else if (error.status) {
      switch (error.status) {
        case 0:
          errorMessage = 'Unable to connect to Elasticsearch. Please check if it is running.';
          break;
        case 400:
          errorMessage = 'Bad request. Please check your query syntax.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please check your credentials.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Internal server error.';
          break;
        default:
          errorMessage = `HTTP error ${error.status}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}