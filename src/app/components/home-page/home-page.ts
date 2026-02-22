import { Component, inject, OnInit } from '@angular/core';
import { BookCard } from '../book-card/book-card';
import BooksService from "../../services/books"
import { HeroComponent } from '../../hero/hero';
@Component({
  selector: 'app-home-page',
  imports: [BookCard,HeroComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {

  booksService  = inject(BooksService)

  topRateBooks: any[] = []
   ngOnInit(): void {
      this.booksService.getBooks().subscribe((data) => {
        this.topRateBooks = data.results;
      })
    }

}
