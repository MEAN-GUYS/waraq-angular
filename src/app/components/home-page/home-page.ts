import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BookCard } from '../book-card/book-card';
import { Book } from '../../models/books';
import { TopAuthor } from '../../models/author';
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
  private readonly changeDetector = inject(ChangeDetectorRef);

  topBoughtBooks: Book[] = [];
  topAuthors: TopAuthor[] = [];

  ngOnInit(): void {
    this.booksService
      .getTopBoughtBooks(12)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((books) => {
        this.topBoughtBooks = books;
        this.changeDetector.detectChanges();
      });

    this.booksService
      .getTopAuthors(6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((authors) => {
        this.topAuthors = authors;
        this.changeDetector.detectChanges();
      });
  }
}
