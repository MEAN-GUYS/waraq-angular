import { Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';
import { Registration } from './components/registration/registration';
import { BooksPage } from './components/books-page/books-page';
import { Login } from './components/login/login';
import { AdminPage } from './components/admin-page/admin-page';
import { CartPage } from './components/cart-page/cart-page';
import { adminGuard, userGuard } from './guards/role.guard';
import { noAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
   { path: "", component: HomePage },
   { path: "books", component: BooksPage },
   { path: "cart", component: CartPage, canActivate: [userGuard] },
   { path: "admin", component: AdminPage, canActivate: [adminGuard] },
   { path: "register", component: Registration, canActivate: [noAuthGuard] },
   { path: "login", component: Login, canActivate: [noAuthGuard] },
];
