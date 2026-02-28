import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../models/books';
import BooksService from '../../services/books';
import { ReviewService, Review } from '../../services/review.service';
import { CartService } from '../../services/cart';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-details.html',
  styleUrl: './book-details.css',
})
export class BookDetails {
  activatedRoute = inject(ActivatedRoute);
  bookService = inject(BooksService);
  reviewService = inject(ReviewService);
  cartService = inject(CartService);

  bookState = signal<Book>({} as Book);
  reviews = signal<Review[]>([]);
  isAddingToCart = signal<boolean>(false);

  ngOnInit(): void {
    const bookId = this.activatedRoute.snapshot.paramMap.get('id');
    if (bookId) {
      this.bookService.getBookById(bookId).subscribe({
        next: (data) => this.bookState.set(data)
      });

      this.reviewService.getBookReviews(bookId).subscribe({
        next: (data) => this.reviews.set(data)
      });
    }
  }

  getStars(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
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
