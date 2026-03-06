import { Injectable } from '@angular/core';
import {environment} from 'src/environments/environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {
  private url = environment.apiURL;
  constructor(private http: HttpClient) { }

  GetLanguages = function() {
    //console.log(`${this.url}/Language`);
    return this.http.get(`${this.url}/Language`);
  };

}
