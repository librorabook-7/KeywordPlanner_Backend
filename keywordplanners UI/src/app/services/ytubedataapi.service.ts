import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class YtubedataapiService {
  url = environment.apiURL;
  autoSuggestURL = environment.autoSuggestURL;
  constructor(private http: HttpClient) {}

  getKeywords(
    searchTerm: string,
    intCriterId: number,
    intLocationId: number,
    strGoogle: string,
    strGoogleSearchNetwork: string,
    excludeKeywordsList: string,
    isKeyword: boolean,
    strSearchVolumeMin: string,
    strSearchVolumeMax: string,
    strCPCMin: string,
    strCPCMax: string,
    strCompetitionMin: string,
    strCompetitionMax: string,
    blnIncludeChartData: boolean,
    state: string,
    city: string,
    pageToken: string
  ) {
    console.log(
      `${this.url}/YoutubeDataAPI?YoutubeSearchKeyword=${searchTerm}&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}&pageToken=${pageToken}&includeChartData=${blnIncludeChartData}&state=${state}`
    );
    return this.http.get(
      `${this.url}/YoutubeDataAPI?YoutubeSearchKeyword=${searchTerm}&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}&pageToken=${pageToken}&includeChartData=${blnIncludeChartData}&state=${state}&city=${city}`,
      { headers: { hideHeader: "true" } }
    );
  }

  getAutoSuggestions = function (searcTerm: string, location: string) {
    //this.autoSuggestURL += searcTerm;
    console.log(environment.autoSuggestURL + searcTerm + `&gl=${0}`);
    return this.http.jsonp(
      environment.autoSuggestURL + searcTerm + `&gl=${location}`,
      "callback"
    );

    // this.http.jsonp(this.autoSuggestURL)
    // .pipe().subscribe(data => {
    //   this.log('data: ' + JSON.stringify(data));
    // });

    //return this.http.jsonp(this.autoSuggestURL, "JSON_CALLBACK");
    // this.$http.get({
    //   url: this.autoSuggestURL,
    //   method: 'JSONP',
    //   headers: {
    //     'Access-Control-Allow-Origin': '*',
    //     'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json'

    //   }
    // }).
    // success(function(data, status, headers, config) {

    //   //console.log('data');
    //   //console.log(data[1]);

    //   var results = data[1];

    // }).
    // error(function(data, status, headers, config) {
    //   console.log('fail');
    //   // called asynchronously if an error occurs
    //   // or server returns response with an error status.
    // });

    // return this.http.jsonp(this.autoSuggestURL, "JSON_CALLBACK")
    //     .map(res => {
    //       return res.json().results.map(item => {
    //         return item;
    //       });
    //     });

    //return this.http.jsonp(this.autoSuggestURL, "JSON_CALLBACK");

    //return this.http.jsonp(this.autoSuggestURL, "callback");

    // this.autoSuggestURL += searcTerm;
    // //this.http.defaults.useXDomain = true;
    // //this.http.jsonp()
    // this.http.get({
    //         url: this.autoSuggestURL,
    //         method: 'JSONP',
    //         headers: {
    //           'Access-Control-Allow-Origin': '*',
    //           'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
    //           'Content-Type': 'application/json',
    //           'Accept': 'application/json'

    //         }
    //       });
    // then(function(data, status, headers, config) {

    //   //console.log('data');
    //   //console.log(data[1]);

    //   var results = data[1];
    //  console.log(data);

    // });
  };
}
