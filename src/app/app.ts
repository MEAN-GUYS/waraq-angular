import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Registration} from './components/registration/registration'
import {HeroComponent} from './hero/hero'
import { NavbarComponent } from './navbar/navbar';
import { CartComponent } from './cart/cart';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Registration,HeroComponent, NavbarComponent, CartComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('waraq');
}
