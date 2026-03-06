import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GtrendingService {
  url = environment.trendapiURL;
  constructor(private http: HttpClient) { }

  getTrendData(searchTerm: string, strMediaType: string, strLanguage: string) {
    console.log(`${this.url}/GetTopics/${searchTerm}/${strMediaType}/${strLanguage}`);
    return this.http.get(`${this.url}/GetTopics/${searchTerm}/${strMediaType}/${strLanguage}`);
  };
}
