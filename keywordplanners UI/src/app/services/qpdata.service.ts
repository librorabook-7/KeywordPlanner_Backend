import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class QpdataService {
  url = environment.apiURL;
  //url = "http://localhost:500/api/"
  constructor(private http: HttpClient) {}

  getPreposition(searchTerm: string) {
    //console.log(`${this.url}/GooglePreposition?jsonGridModelList=${searchTerm}`);
    //return this.http.get(`${this.url}/GooglePreposition?jsonGridModelList=${searchTerm}`);

    let objLongJSON = { LongJSON: searchTerm };
    //console.log(objLongJSON);
    return this.http.post(`${this.url}/GooglePreposition`, objLongJSON);
  }

  getQuestions(searchTerm: string) {
    debugger;
    let objLongJSON = { LongJSON: searchTerm };
    console.log(objLongJSON);
    return this.http.post(`${this.url}/GoogleQuestions`, objLongJSON);
  }
}
