import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse ,RegistrationPayload} from '../models/registration'
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) { }

  register(payload: RegistrationPayload): Observable<AuthResponse> {
    const body = {
      name: `${payload.firstName} ${payload.lastName}`, 
      email: payload.email,
      password: payload.password,
    };
    console.log(environment.apiUrl);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/users`, body);
  }

}
