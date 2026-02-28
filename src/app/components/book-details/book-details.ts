import { Component, inject, signal } from '@angular/core';
import { Book } from '../../models/books';
import BooksService from '../../services/books';
import { CartService } from '../../services/cart';
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
  cartService = inject(CartService);


  bookState = signal<Book>({} as Book);
  isAddingToCart = signal<boolean>(false);

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

  onAddToCart(): void {
    const book = this.bookState();

    if (!book || !book.id || book.stock === 0 || this.isAddingToCart()) return;

    this.isAddingToCart.set(true);
    this.cartService.addToCart(book.id, 1);
    
    setTimeout(() => {
        this.isAddingToCart.set(false);
    }, 500);
  }

  
  
}
