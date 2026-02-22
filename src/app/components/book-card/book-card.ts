import { Component, input } from '@angular/core';
import { Book } from '../../models/books';

@Component({
  selector: 'app-book-card',
  imports: [],
  templateUrl: './book-card.html',
  styleUrl: './book-card.css',
})
export class BookCard {
book = input.required<Book>()
}
