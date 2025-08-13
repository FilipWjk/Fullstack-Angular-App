import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './features/navbar/navbar';
import { Card } from './features/card/card';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Card],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private apiService = inject(ApiService);
  protected readonly title = signal('Fullstack Angular & Nest.js App');
  protected message = signal<string>('');

  constructor() {
    this.apiService.getHello().subscribe({
      next: (msg) => {
        return this.message.set(msg);
      },
      error: (err) => this.message.set('Error: ' + (err?.message || 'Unknown')),
    });
  }
}
