import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  url = environment.authURL;
  apiURL = environment.apiURL;
  constructor(private http: HttpClient) { }

  // getGoogleAuth = function(){
    
  //   //console.log(objLongJSON);
  //   return this.http.get(`http://localhost/KeywordPlannerAPI/AuthCallBack/AuthCallBack`);
  // };

  getUserData = function(){
    return this.http.get(`${this.url}/AuthCallBack/GetUserInfo`);
    //return this.http.get(`http://192.168.192.175/KeywordPlannerAPI/AuthCallBack/GetUserInfo`);
  }

  getUserAccounts = function(userData: any){
    return this.http.post(`${this.apiURL}/AdWordAccount`, userData);
  }

  getUserCampaigns = function(userData: any){
    return this.http.post(`${this.apiURL}/AdWordCampaign`, userData);
  }

  getUserAdGroups = function(userData: any, campaingId: string){
    return this.http.post(`${this.apiURL}/AdWordAdGroup?CampaignId=${campaingId}`, userData);
  }

  createAds = function(objAds: any){
    return this.http.post(`${this.apiURL}/AdWordAds`, objAds);
  }
}
