import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent {
  label = 'ONE MORE BOOK!';
  title = 'Your Next Favorite Book Lives Here';
  description = 'Waraq.. A Universe Between pages where stories find you!';
}