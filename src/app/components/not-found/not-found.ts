import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 text-center p-6">
      <h1 class="text-8xl font-bold text-amber-600 mb-2">404</h1>
      <p class="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</p>
      <p class="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <a routerLink="/" class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition">
        Back to Home
      </a>
    </div>
  `
})
export class NotFoundComponent {}
