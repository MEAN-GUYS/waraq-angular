import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCard } from './book-card';
import { Book } from '../../models/books';

describe('BookCard', () => {
  let component: BookCard;
  let fixture: ComponentFixture<BookCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookCard);
    const book: Book = {
      id: 'book-1',
      name: 'Test Book',
      description: 'Test description',
      cover: 'cover.jpg',
      price: 10,
      stock: 1,
      averageRating: 5,
      reviewCount: 1,
    };
    fixture.componentRef.setInput('book', book);
    fixture.detectChanges();
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
