import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BookCard } from '../book-card/book-card';
import { Book } from '../../models/books';
import BooksService from '../../services/books';
import { HeroComponent } from '../../hero/hero';

@Component({
  selector: 'app-home-page',
  imports: [BookCard, HeroComponent, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private readonly booksService = inject(BooksService);
  private readonly destroyRef = inject(DestroyRef);

  topRateBooks: Book[] = [];

  ngOnInit(): void {
    this.booksService
      .getBooks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.topRateBooks = data.results;
      });
  }
}
