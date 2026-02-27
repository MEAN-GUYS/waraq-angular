import { Component, inject, signal } from '@angular/core';
import { Book } from '../../models/books';
import BooksService from '../../services/books';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-book-details',
  imports: [],
  templateUrl: './book-details.html',
  styleUrl: './book-details.css',
})
export class BookDetails {
  activtedRoute = inject(ActivatedRoute);
  bookService = inject(BooksService);

  bookState = signal<Book>({} as Book);

  ngOnInit(): void {
    const bookId = this.activtedRoute.snapshot.paramMap.get('id');
    if (bookId) {
      this.bookService.getBookById(bookId)
      .subscribe({
        next: (data) => {
          this.bookState.set(data);
        },
        error: (err) => {
          console.error('Error fetching book details:', err);
        },
      });
    }
  }
  
  
}
