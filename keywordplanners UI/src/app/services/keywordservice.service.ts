import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class KeywordserviceService {
  //url = 'http://localhost/KeywordPlannerAPI/api';
  url = environment.apiURL;
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
    blnHideLoader: boolean,
    wordCount: number,
    state: string,
    city: string,
    PageToken: string = ""
  ) {
    console.log(
      `${this.url}/Google?Keyarray=${searchTerm}&IdeaType=2&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}&pageToken=${PageToken}&state=${state}`
    );

    if (blnHideLoader == false) {
      return this.http.get(
        `${this.url}/Google?Keyarray=${searchTerm}&IdeaType=2&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}&pageToken=${PageToken}&includeChartData=${blnIncludeChartData}&keywordCount=${wordCount}&state=${state}&city=${city}`
      );
    } else {
      return this.http.get(
        `${this.url}/Google?Keyarray=${searchTerm}&IdeaType=2&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}&pageToken=${PageToken}&includeChartData=${blnIncludeChartData}&keywordCount=${wordCount}&state=${state}&city=${city}`,
        { headers: { hideHeader: "true" } }
      );
    }
  }

  getSearchKeywordInfo(
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
    blnIncludeChartData: boolean
  ) {
    console.log(
      `${this.url}/Google?Keyarray=${searchTerm}&IdeaType=3&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}`
    );
    return this.http.get(
      `${this.url}/Google?Keyarray=${searchTerm}&IdeaType=3&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}&includeChartData=${blnIncludeChartData}`,
      { headers: { hideHeader: "true" } }
    );
  }

  getCompAnalysis(
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
    blnHideLoader: boolean,
    pageToken: string
  ) {
    console.log(
      `${this.url}/Google?Keyarray=${searchTerm}&IdeaType=4&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}`
    );

    if (blnHideLoader == false) {
      return this.http.get(
        `${this.url}/Google?Keyarray=${searchTerm}&IdeaType=4&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}&pageToken=${pageToken}&includeChartData=${blnIncludeChartData}`
      );
    } else {
      return this.http.get(
        `${this.url}/Google?Keyarray=${searchTerm}&IdeaType=4&languageId=${intCriterId}&locationId=${intLocationId}&targetGoogleSearch=${strGoogle}&targetSearchNetwork=${strGoogleSearchNetwork}&excludeKeywordsList=${excludeKeywordsList}&isKeyword=${isKeyword}&searchVolumeMin=${strSearchVolumeMin}&searchVolumeMax=${strSearchVolumeMax}&cpcMin=${strCPCMin}&cpcMax=${strCPCMax}&competitionMin=${strCompetitionMin}&competitionMax=${strCompetitionMax}&pageToken=${pageToken}&includeChartData=${blnIncludeChartData}`,
        { headers: { hideHeader: "true" } }
      );
    }
  }

  getChartSummary(searchTerm: string) {
    console.log(`${this.url}/Google?Keyarray=${searchTerm}&IdeaType=1`);
    return this.http.get(
      `${this.url}/Google?Keyarray=${searchTerm}&IdeaType=1`
    );
  }

  getSearchVolumeTabInfo = function (userData: any) {
    return this.http.post(`${this.url}/Google`, userData);
  };
}
