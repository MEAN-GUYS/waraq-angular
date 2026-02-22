import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { BooksResponse } from '../models/books';

@Injectable({
  providedIn: 'root',
})
export  default class BooksService {
  constructor (private http : HttpClient){}

  getBooks( ):  Observable<BooksResponse> {
   
        //console.log(environment.apiUrl);
        return this.http.get<BooksResponse>(`${environment.apiUrl}/books`);
  }

}
