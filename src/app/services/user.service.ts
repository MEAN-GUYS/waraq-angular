import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/registration';

export interface UsersResponse {
    results: User[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
}

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly USER_URL = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getUsers(params?: any): Observable<UsersResponse> {
        let httpParams = new HttpParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    httpParams = httpParams.set(key, String(value));
                }
            });
        }
        return this.http.get<UsersResponse>(this.USER_URL, { params: httpParams });
    }

    getUser(id: string): Observable<User> {
        return this.http.get<User>(`${this.USER_URL}/${id}`);
    }

    updateUser(id: string, user: Partial<User>): Observable<User> {
        return this.http.patch<User>(`${this.USER_URL}/${id}`, user);
    }

    deleteUser(id: string): Observable<void> {
        return this.http.delete<void>(`${this.USER_URL}/${id}`);
    }
}
