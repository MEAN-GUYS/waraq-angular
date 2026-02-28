import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { BookCard } from '../book-card/book-card';
import { Book } from '../../models/books';
import { Author, TopAuthor } from '../../models/author';
import BooksService from '../../services/books';
import { AuthorService } from '../../services/author.service';
import { HeroComponent } from '../../hero/hero';

@Component({
  selector: 'app-home-page',
  imports: [BookCard, HeroComponent, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private readonly booksService = inject(BooksService);
  private readonly authorService = inject(AuthorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);

  topBoughtBooks: Book[] = [];
  topAuthors: (TopAuthor | Author)[] = [];
  hasTopBooks = true;
  hasTopAuthors = true;

  ngOnInit(): void {
    this.booksService
      .getTopBoughtBooks(12)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((books) => {
        if (books.length > 0) {
          this.topBoughtBooks = books;
        } else {
          this.hasTopBooks = false;
          this.booksService.getBooks({ limit: 12 })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
              this.topBoughtBooks = data.results;
              this.changeDetector.detectChanges();
            });
        }
        this.changeDetector.detectChanges();
      });

    this.booksService
      .getTopAuthors(6)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((authors) => {
        if (authors.length > 0) {
          this.topAuthors = authors;
        } else {
          this.hasTopAuthors = false;
          this.authorService.getAuthors({ limit: 6 })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
              this.topAuthors = data.results;
              this.changeDetector.detectChanges();
            });
        }
        this.changeDetector.detectChanges();
      });
  }
}
