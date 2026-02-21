import { Component } from '@angular/core';
import { HeroComponent } from './hero/hero';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeroComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App{}