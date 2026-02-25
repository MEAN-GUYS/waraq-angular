import { Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';
import { Registration } from './components/registration/registration';
import { BooksPage } from './components/books-page/books-page';
import { Login } from './components/login/login';

export const routes: Routes = [
   { path: "", component: HomePage },
   { path: "books", component: BooksPage },
   { path: "register", component: Registration },
   { path: "login", component: Login },
];
