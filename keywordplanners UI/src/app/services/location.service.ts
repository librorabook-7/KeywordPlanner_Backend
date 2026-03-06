import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class LocationService {
  private url = environment.apiURL;
  constructor(private http: HttpClient) {}

  GetLocations = function () {
    //console.log(`${this.url}/Language`);
    return this.http.get(`${this.url}/Location`);
  };
  GetStates = function (countryId) {
    return this.http.get(`${this.url}/google/GetCities?countryID=${countryId}`);
  };
}
