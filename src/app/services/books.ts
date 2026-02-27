import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BooksParams, BooksResponse } from '../models/books';

@Injectable({
  providedIn: 'root',
})
export default class BooksService {
  constructor(private http: HttpClient) { }

  getBooks(params?: BooksParams): Observable<BooksResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        const isPrimitive = ['string', 'number', 'boolean'].includes(typeof value);
        if (value !== undefined && value !== null && isPrimitive) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http.get<BooksResponse>(`${environment.apiUrl}/books`, { params: httpParams });
  }

  createBook(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/books`, formData);
  }

  updateBook(id: string, formData: FormData): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/books/${id}`, formData);
  }

  deleteBook(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/books/${id}`);
  }
}
