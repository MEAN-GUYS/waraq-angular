import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import BooksService from '../../services/books';
import { AuthorService } from '../../services/author.service';
import { UserService } from '../../services/user.service';
import { AdminPage } from './admin-page';

describe('AdminPage', () => {
  it('computes dashboard totals from API counts and orders list', () => {
    TestBed.configureTestingModule({
      imports: [AdminPage],
      providers: [
        {
          provide: BooksService,
          useValue: {
            getBooks: () =>
              of({
                results: [],
                page: 1,
                limit: 1,
                totalPages: 1,
                totalResults: '42',
              } as any),
          },
        },
        {
          provide: AuthorService,
          useValue: {
            getAuthors: () =>
              of({
                results: [],
                page: 1,
                limit: 1,
                totalPages: 1,
                totalResults: 0,
              }),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUsers: () =>
              of({
                results: [],
                page: 1,
                limit: 1,
                totalPages: 1,
                totalResults: '7',
              } as any),
            deleteUser: () => of(void 0),
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(AdminPage);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.totalBooks()).toBe(42);
    expect(component.totalUsers()).toBe(7);
    expect(component.totalOrders()).toBe(3);
    expect(component.totalRevenue()).toBeCloseTo(118.91, 2);
  });
});
