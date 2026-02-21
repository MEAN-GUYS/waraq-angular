import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Registration} from './components/registration/registration'
import {HeroComponent} from './hero/hero'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Registration,HeroComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('waraq');
}
