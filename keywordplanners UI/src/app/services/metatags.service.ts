import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class MetaTagsService {
  private url = environment.apiURL;
  constructor(private http: HttpClient) {}

  getMetaTags = function () {
    return this.http.get(`${this.url}/app/GetMetaTags`);
  };

  addMetaTags(metaName, content) {
    return this.http.post(`${this.url}/app/AddMetaTags`, {
      MetaName: metaName,
      Content: content,
    });
  }
  syncMetaTags = function () {
    return this.http.get(`${this.url}/app/SyncMetaTags`);
  };
  deleteMetaTags(metaTagID) {
    return this.http.get(
      `${this.url}/app/DeleteMetaTags?metatagid=` + metaTagID
    );
  }
}
