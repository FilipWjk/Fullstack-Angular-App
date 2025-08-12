import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  getHello(): Observable<string> {
    return this.http.get<{ message: string }>('/api').pipe(
      map((response) => {
        return response.message;
      })
    );
  }
}
