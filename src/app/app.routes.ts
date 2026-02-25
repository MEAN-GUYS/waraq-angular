import { Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';
import { Registration } from './components/registration/registration';
import { CartComponent } from './cart/cart';

import { BooksPage } from './components/books-page/books-page';

export const routes: Routes = [
    {path : ""  ,component : HomePage},
   //{path : "books"  ,component : BooksPage},*/
    {path: "register" , component: Registration}, 
    { path: 'cart', component: CartComponent }
];
