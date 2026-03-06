import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import LanguageData from 'src/app/models/LanguageData';
import { LanguagesService } from 'src/app/services/languages.service';
import KeywordData, {  GridBarModel, Type2Data } from '../../models/KeywordData';
import { KeywordserviceService } from '../../services/keywordservice.service';
import {GtrendingService} from '../../services/gtrending.service';
import TrendData from '../../models/TrendData';
import { LocationService } from '../../services/location.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-googletrends',
  templateUrl: './googletrends.component.html',
  styleUrls: ['./googletrends.component.css']
})
export class GoogletrendsComponent implements OnInit {
  refineSearchPathTrend : string;
  showSearchSectionTrend : boolean;
  config: any;
  languagesList: LanguageData[] = [];
  GridBarModel: GridBarModel;
  searchParam: string;
  keywordData: KeywordData[] = [];
  fullKeywordData: KeywordData[] = [];
  googleTrendData: any;
  TopTrendData: TrendData;
  RisingTrendData: TrendData;
  locationList: any[] = [];
  imagePrePath: string = "";
  languageSelectedValue : string = "2840/1000";
  keywordDataLength: number = 0;
  gTrendTab: number = 1;

  constructor(private languageService: LanguagesService, private ks: KeywordserviceService,
    private gts: GtrendingService, private locationService: LocationService) { }

  @Output() showErrorParent = new EventEmitter();

  ngOnInit() {
    this.getLanguages();
    this.getLocations();
    this.imagePrePath = environment.authURL;
    this.keywordDataLength = 0
  }
  ngAfterViewInit(){
    this.refineSearchPathTrend = "../../../assets/arrow_down.png";
    this.showSearchSectionTrend = false;
  }

  getLanguages = function(){
    this.languageService.GetLanguages().subscribe((data: LanguageData) => {
      
      this.languagesList = data;
    },
    error => {
      this.showErrorMessage("Languages are not loaded.")
      console.log("Error");
    });
  }

  getLocations = function(){
    this.locationService.GetLocations().subscribe((data) => {
      this.locationList = data;
    },
    error => {
      this.showErrorMessage("Locations are not loaded.")
      console.log("Error");
    });
  }

  setTab = function(newTab){
    this.gTrendTab = newTab;
  };

  isSet = function(tabNum){
    return this.gTrendTab === tabNum;
  };

  onEnter(event) { 
    
    if (event.key === "Enter") {
      //console.log(event.target.value);
      
      this.onClickMe(event.target.value, "news");
      return false;
    } 
    
  }

  onClickMe(searchTerm: string, strMediaType: string) {
    if(searchTerm.trim() != ""){
      this.getTrnedData(searchTerm.trim(), strMediaType, this.getLanguageCode());
    }
    else{
      debugger;
      this.showErrorMessage("Enter keyword to search.")
    }
  }
  // onClickMe(searchTerm: string, strMediaType: string) {
  //   if(searchTerm.trim() != ""){
      
  //     var arrayCodes  = this.languageSelectedValue.split('/');
  //     let targetGoogleSearch: string = "true";
  //     let targetGoogleNetworkSearch: string = "false";
  //     this.ks.getKeywords(searchTerm, arrayCodes[1] as any, arrayCodes[0] as any, targetGoogleSearch, targetGoogleNetworkSearch).subscribe((data: Type2Data) => {
  //         console.log(data);
  //         this.fullKeywordData = JSON.parse(JSON.stringify(this.keywordData));
  //         this.GridBarModel = data.GridBarModel;
  //         this.keywordData = data.GridModelList;
  //         this.searchParam = searchTerm;
         
  //         console.log("Success");
  //       },
  //       error => {
  //         //this.showErrorMessage("Daily calls limit has been exceeded, press Search button after 15 seconds.")
  //         console.log("Error");
  //     });
  //     debugger;
  //     this.getTrnedData(searchTerm.trim(), strMediaType, this.getLanguageCode());
  //   }
  //   else{
  //     debugger;
  //     this.showErrorMessage("Enter keyword to search.")
  //   }
  // }

  showErrorMessage(errorString){
    this.showErrorParent.emit(errorString);
  }

  getTrnedData = function(userSearchTerm: string, strMediaType: string, strLanguage: string){
    
    this.gts.getTrendData(userSearchTerm, strMediaType, strLanguage).subscribe((data) => {
      debugger;
      if(data.errno == "ETIMEDOUT"){
        
      }
      else{
        this.googleTrendData = JSON.parse(data);
        console.log(this.googleTrendData);
        if(this.googleTrendData.default != undefined && this.googleTrendData.default != null){
          this.searchParam = userSearchTerm;
          this.TopTrendData = this.googleTrendData.default.rankedList[0].rankedKeyword;
          this.RisingTrendData = this.googleTrendData.default.rankedList[1].rankedKeyword;

          

          this.getChartBarModel(userSearchTerm);
        }
      }
      
      
    },
    error => {
      //this.showErrorMessage("Daily calls limit has been exceeded, press Search button after 15 seconds.")
      console.log("Error");
    });
  }

  getLanguageCode = function(){
    var strLanguageCode = "";

    for(var i=0; i<this.locationList.length; i++){
      if(this.locationList[i].CCLC == this.languageSelectedValue){
        strLanguageCode = this.locationList[i].Hl;
        break;
      }
    }
    return strLanguageCode;
  }

  getChartBarModel = function (userSearchTerm: string) {
    //this.TopTrendData
    this.GridBarModel = new GridBarModel();
    this.GridBarModel.Xaxis = [];
    this.GridBarModel.Yaxis = [];
    this.GridBarModel.TotalTernd = "0";
    this.GridBarModel.TotalAverageCPC = 0;
    this.GridBarModel.AverageCompetition = 0;
    this.GridBarModel.TotalSearchVolume = 0;

    for(var i=0; i<this.TopTrendData.length; i++){
      let objTopTrendData = this.TopTrendData[i];
      this.GridBarModel.Xaxis.push(objTopTrendData.topic.title);
      this.GridBarModel.Yaxis.push(objTopTrendData.value);
    }
    let lstFullRisignData = JSON.parse(JSON.stringify(this.RisingTrendData));
    
    // this.RisingTrendData = lstFullRisignData.filter(function (objRisingTrendData, index) {
    //   return (objRisingTrendData.topic.title.indexOf(userSearchTerm) > -1);
    // });

    // this.RisingTrendData = this.RisingTrendData.concat(lstFullRisignData.filter(function (objRisingTrendData, index) {
    //   return (objRisingTrendData.topic.title.indexOf(userSearchTerm) == -1);
    // }));

    this.keywordDataLength = this.RisingTrendData.length;
  }

}
