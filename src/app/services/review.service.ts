import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Review {
  id: string;
  user: { name: string };
  book: string;
  rating: number;
  review: string;
  liked: boolean | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access_token');
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    };
  }

  submitReview(body: { bookId: string; rating: number; review: string; liked: boolean | null }): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, body, this.getHeaders());
  }

  getBookReviews(bookId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/book/${bookId}`);
  }
}