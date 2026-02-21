import { Routes } from '@angular/router';
import { HeroComponent } from './hero/hero';
import { CartComponent } from './cart/cart';

export const routes: Routes = [
  { path: '', component: HeroComponent },
  { path: 'cart', component: CartComponent }
];