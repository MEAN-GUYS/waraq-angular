import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Author, AuthorsResponse } from '../models/author';

@Injectable({
    providedIn: 'root',
})
export class AuthorService {
    private readonly AUTH_URL = `${environment.apiUrl}/authors`;

    constructor(private http: HttpClient) { }

    getAuthors(params?: any): Observable<AuthorsResponse> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }
        return this.http.get<AuthorsResponse>(this.AUTH_URL, { params: httpParams });
    }

    getAuthor(id: string): Observable<Author> {
        return this.http.get<Author>(`${this.AUTH_URL}/${id}`);
    }

    createAuthor(author: Partial<Author>): Observable<Author> {
        return this.http.post<Author>(this.AUTH_URL, author);
    }

    updateAuthor(id: string, author: Partial<Author>): Observable<Author> {
        return this.http.patch<Author>(`${this.AUTH_URL}/${id}`, author);
    }

    deleteAuthor(id: string): Observable<void> {
        return this.http.delete<void>(`${this.AUTH_URL}/${id}`);
    }
}
