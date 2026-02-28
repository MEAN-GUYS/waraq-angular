import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  team = [
    { name: 'Shahd Mostafa' },
    { name: 'Karim Ibrahim' },
    { name: 'Abdelrahman Ibrahim' },
    { name: 'Ahmed Ehab', note: 'Mansoura' }
  ];
}