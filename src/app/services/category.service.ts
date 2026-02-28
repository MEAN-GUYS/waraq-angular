import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, CategoriesResponse } from '../models/category';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly URL = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(params?: any): Observable<CategoriesResponse> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<CategoriesResponse>(this.URL, { params: httpParams });
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.URL, category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.URL}/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }
}
