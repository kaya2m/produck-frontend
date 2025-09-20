import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaginatedResponse } from '../models/auth.models';
import { environment } from '../../../environments/environment';

export interface QueryParams {
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = environment.api.baseUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    const url = endpoint.startsWith('/') ? `${this.BASE_URL}${endpoint}` : `${this.BASE_URL}/${endpoint}`;
    return this.http.get<T>(url, { params: httpParams });
  }

  getPaginated<T>(endpoint: string, params?: PaginationParams & QueryParams): Observable<PaginatedResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    const url = endpoint.startsWith('/') ? `${this.BASE_URL}${endpoint}` : `${this.BASE_URL}/${endpoint}`;
    return this.http.get<PaginatedResponse<T>>(url, { params: httpParams });
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    const url = endpoint.startsWith('/') ? `${this.BASE_URL}${endpoint}` : `${this.BASE_URL}/${endpoint}`;
    return this.http.post<T>(url, data);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    const url = endpoint.startsWith('/') ? `${this.BASE_URL}${endpoint}` : `${this.BASE_URL}/${endpoint}`;
    return this.http.put<T>(url, data);
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    const url = endpoint.startsWith('/') ? `${this.BASE_URL}${endpoint}` : `${this.BASE_URL}/${endpoint}`;
    return this.http.patch<T>(url, data);
  }

  delete<T>(endpoint: string, data?: any): Observable<T> {
    const url = endpoint.startsWith('/') ? `${this.BASE_URL}${endpoint}` : `${this.BASE_URL}/${endpoint}`;
    const options = data ? { body: data } : {};
    return this.http.delete<T>(url, options);
  }

  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.BASE_URL}/${endpoint}`, formData);
  }

  download(endpoint: string, params?: QueryParams): Observable<Blob> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get(`${this.BASE_URL}/${endpoint}`, {
      params: httpParams,
      responseType: 'blob'
    });
  }

  private buildHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => httpParams = httpParams.append(key, v.toString()));
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }
}