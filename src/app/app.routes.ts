import { Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';
import { Registration } from './components/registration/registration';
import { OrdersPage } from './components/orders-page/orders-page';
import { CartComponent } from './cart/cart';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'register', component: Registration },
  { path: 'my-orders', component: OrdersPage },
  { path: 'cart', component: CartComponent }
];