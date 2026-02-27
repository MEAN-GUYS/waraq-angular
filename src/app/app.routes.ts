import { Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';
import { BooksPage } from './components/books-page/books-page';
import { Registration } from './components/registration/registration';
import { OrdersPage } from './components/orders-page/orders-page';
import { CartComponent } from './cart/cart';
import { AdminPage } from './components/admin-page/admin-page';
import { Login } from './components/login/login';
import { noAuthGuard } from './guards/no-auth.guard';
import { userGuard, adminGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'my-orders', component: OrdersPage, canActivate: [userGuard]},
  { path: "books", component: BooksPage },
  { path: "cart", component: CartComponent, canActivate: [userGuard] },
  { path: "admin", component: AdminPage, canActivate: [adminGuard] },
  { path: "register", component: Registration, canActivate: [noAuthGuard] },
  { path: "login", component: Login, canActivate: [noAuthGuard] },
];
