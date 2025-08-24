import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Card } from '@models/card';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CardsService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage =
          'Unable to connect to server. Please check if the server is running.';
      } else {
        errorMessage = `Server Error ${error.status}: ${
          error.error?.message || error.message
        }`;
      }
    }

    console.error('CardsService Error Details:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      url: error.url,
      message: errorMessage,
    });

    return throwError(() => new Error(errorMessage));
  }

  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/cards`).pipe(
      catchError((error) => {
        console.error('CardsService: Get cards error', error);
        return this.handleError(error);
      })
    );
  }

  addCard(
    card: Omit<Card, 'id' | 'createdAt' | 'updatedAt'>
  ): Observable<Card> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post<Card>(`${this.baseUrl}/cards`, card, { headers })
      .pipe(
        catchError((error) => {
          console.error('CardsService: Add card error', error);
          return this.handleError(error);
        })
      );
  }

  updateCard(id: number, card: Partial<Omit<Card, 'id'>>): Observable<Card> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .put<Card>(`${this.baseUrl}/cards/${id}`, card, { headers })
      .pipe(
        catchError((error) => {
          console.error('CardsService: Update card error', error);
          return this.handleError(error);
        })
      );
  }

  deleteCard(id: number): Observable<{ success: boolean }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .delete<{ success: boolean }>(`${this.baseUrl}/cards/${id}`, { headers })
      .pipe(catchError((error) => this.handleError(error)));
  }
}
