import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, PaginatedResponse } from '../models/auth.models';

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
  private readonly BASE_URL = 'https://localhost:7001/api';

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<T>>(`${this.BASE_URL}/${endpoint}`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  getPaginated<T>(endpoint: string, params?: PaginationParams & QueryParams): Observable<PaginatedResponse<T>> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<ApiResponse<PaginatedResponse<T>>>(`${this.BASE_URL}/${endpoint}`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.BASE_URL}/${endpoint}`, data)
      .pipe(map(response => response.data));
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.BASE_URL}/${endpoint}`, data)
      .pipe(map(response => response.data));
  }

  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.BASE_URL}/${endpoint}`, data)
      .pipe(map(response => response.data));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.BASE_URL}/${endpoint}`)
      .pipe(map(response => response.data));
  }

  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.BASE_URL}/${endpoint}`, formData)
      .pipe(map(response => response.data));
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