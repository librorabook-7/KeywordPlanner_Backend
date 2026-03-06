import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from "@angular/core";
import { KeywordserviceService } from "../../services/keywordservice.service";
import KeywordData, { GridBarModel, Type2Data } from "../../models/KeywordData";
import { Chart } from "chart.js";
import { LanguagesService } from "src/app/services/languages.service";
import LanguageData from "src/app/models/LanguageData";
import { MatDialog } from "@angular/material/dialog";

import { AddCampaignComponent } from "../add-campaign/add-campaign.component";
import { QpdataService } from "src/app/services/qpdata.service";
import { GoogleAuthService } from "../../services/google-auth.service";
import { environment } from "src/environments/environment";
import { ExcelServicesService } from "../../services/excel-services.service";
import { LocationService } from "../../services/location.service";
import { AccountopService } from "../../services/accountop.service";
import { Subscription } from "rxjs";
import { KeywordUtilService } from "src/app/services/keyword-util.service";

//import { parse } from 'path';
@Component({
  selector: "app-keywordsearch",
  templateUrl: "./keywordsearch.component.html",
  styleUrls: ["./keywordsearch.component.css"],
})
export class KeywordsearchComponent implements OnInit {
  keywordData: KeywordData[] = [];
  fullKeywordData: KeywordData[] = [];
  relatedKeywordDate: KeywordData[] = [];
  GridBarModel: GridBarModel;
  Type2Data: Type2Data;
  barchart: [];
  config: any;
  prepConfig: any;
  questionConfig: any;
  relatedKeywordConfig: any;
  collection = { count: 0, data: [] };
  searchParam: string;
  refineSearchPath: string;
  showSearchSection: boolean;
  languagesList: LanguageData[] = [];
  pickedKeywordsInput: string[] = [];
  questionsData: KeywordData[] = [];
  prepData: KeywordData[] = [];
  locationList: any[] = [];
  stateList: any[] = [];
  cityList: any[] = [];
  monthList: string[] = [];
  imagePrePath: string = "";
  languageSelectedValue: string = "2840/1000";
  uniqueLanguageList: any[] = [];
  uniqueLocationList: any[] = [];
  tabIndex: number = 0;
  lcRelatedKeywords: any[] = [];
  tab: number = 1;
  blnIsUserLogged: boolean = false;
  wordCount: number = 10;
  recursiveSearchSubscription: Subscription;
  pageToken: string = "";
  gridModelList: KeywordData[];
  loadMoreRecords: boolean = true;

  constructor(
    private ks: KeywordserviceService,
    private languageService: LanguagesService,
    private mdDialog: MatDialog,
    private qpService: QpdataService,
    private googleAuthService: GoogleAuthService,
    private excelService: ExcelServicesService,
    private locationService: LocationService,
    private accountService: AccountopService,
    private keywordUtilService: KeywordUtilService
  ) {
    //this.configure();
  }

  @Input() rowIndex: number;
  @Output() showErrorParent = new EventEmitter();
  //@Input() blnIsUserLogged : boolean;

  ngOnInit() {
    this.config = {
      id: "keywordPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.prepConfig = {
      id: "prepPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.questionConfig = {
      id: "questionsPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.relatedKeywordConfig = {
      id: "relatedKeywordPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };
    this.pageToken = "";

    this.imagePrePath = environment.authURL;
    this.refineSearchPath = "fa fa-chevron-up";
    this.showSearchSection = true;
    //this.getLanguages();
    this.getLocations();
    this.onGetMonths();

    this.accountService.checkUserLoggedIn().subscribe((data: any) => {
      data = JSON.parse(data);
      if (data.UserInfo == null) {
        //this.isUserLoggedIn = false;
        this.blnIsUserLogged = false;
        this.accountService.setSignIn(false);
        this.wordCount = 10;
      } else {
        this.blnIsUserLogged = true;
        this.accountService.setSignIn(true);
        this.wordCount = data.UserInfo[0].wordCount;
      }
      //
    });
  }

  ngAfterViewInit() {
    if (
      localStorage.getItem("statechanged") != undefined &&
      localStorage.getItem("statechanged") == "true" &&
      window.location.href.indexOf("silentrefresh") == -1
    ) {
      this.pickedKeywordsInput = JSON.parse(
        localStorage.getItem("pickedkeywords")
      );
      this.removeLocalStorage();
      this.googleAuthService.getUserData().subscribe(
        (data) => {
          //console.log(data);
          const dialogRef = this.mdDialog.open(AddCampaignComponent, {
            data: {
              PickedKeywords: this.pickedKeywordsInput,
              UserData: data,
              ShowError: this.showErrorMessage,
            },
          });
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }

  getUrlParameter = function (name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null
      ? ""
      : decodeURIComponent(results[1].replace(/\+/g, " "));
  };

  onShowAddCampaingPopup = function () {
    localStorage.setItem(
      "pickedkeywords",
      JSON.stringify(this.pickedKeywordsInput)
    );
    window.location.href = environment.authURL + "/AuthCallBack/AuthCallBack";
  };

  removeLocalStorage = function () {
    //localStorage.removeItem("comp");
    localStorage.removeItem("pickedkeywords");
    localStorage.removeItem("statechanged");
  };

  onShowHideSearchPanel = function (event) {
    event.stopPropagation();
    if (this.refineSearchPath.indexOf("fa fa-chevron-down") > -1) {
      this.refineSearchPath = "fa fa-chevron-up";
      this.showSearchSection = true;
    } else {
      this.refineSearchPath = "fa fa-chevron-down";
      this.showSearchSection = false;
    }
  };

  onGetMonths = function () {
    var monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var dtDate = new Date();
    var intCurrentMonth = dtDate.getMonth() - 1;
    var intCurrentYear = dtDate.getFullYear();

    for (var i = 0; i < 12; i++) {
      if (intCurrentMonth == -1) {
        intCurrentMonth = 11;
        intCurrentYear -= 1;
      }

      this.monthList.push(
        monthNames[intCurrentMonth] +
          " " +
          intCurrentYear.toString().replace("20", "")
      );
      intCurrentMonth -= 1;
    }

    this.monthList = this.monthList.reverse();
  };

  onRefineSearch = function (
    searchVolumeMin: string,
    searchVolumeMax: string,
    CPCMin: string,
    CPCMax: string,
    competitionMin: string,
    competitionMax: string
  ) {
    if (this.fullKeywordData.length == 0) {
      this.showErrorMessage("Please search keyword data first.");
    } else if (this.fullKeywordData.length > 0) {
      this.keywordData = JSON.parse(JSON.stringify(this.fullKeywordData));

      if (
        searchVolumeMin != "" &&
        Number(searchVolumeMin) != NaN &&
        parseInt(searchVolumeMin) > 0
      ) {
        this.keywordData = this.keywordData.filter(function (
          objKeywordData,
          index
        ) {
          return objKeywordData.SearchVolume > parseInt(searchVolumeMin);
        });
      }

      if (
        searchVolumeMax != "" &&
        Number(searchVolumeMax) != NaN &&
        parseInt(searchVolumeMax) > 0
      ) {
        this.keywordData = this.keywordData.filter(function (
          objKeywordData,
          index
        ) {
          return objKeywordData.SearchVolume < parseInt(searchVolumeMax);
        });
      }

      // if(CPCMin != "" && Number(CPCMin) != NaN && parseFloat(CPCMin) > 0){
      //   this.keywordData = this.keywordData.filter(function (objKeywordData, index) {
      //     return (objKeywordData.AverageCPC > parseFloat(CPCMin));
      //   });
      // }

      // if(CPCMax != "" && Number(CPCMax) != NaN && parseInt(CPCMax) > 0){
      //   this.keywordData = this.keywordData.filter(function (objKeywordData, index) {
      //     return (objKeywordData.AverageCPC < parseFloat(CPCMax));
      //   });
      // }

      if (
        competitionMin != "" &&
        Number(competitionMin) != NaN &&
        parseFloat(competitionMin) > 0
      ) {
        this.keywordData = this.keywordData.filter(function (
          objKeywordData,
          index
        ) {
          return objKeywordData.Competition > parseFloat(competitionMin);
        });
      }

      if (
        competitionMax != "" &&
        Number(competitionMax) != NaN &&
        parseFloat(competitionMax) > 0
      ) {
        this.keywordData = this.keywordData.filter(function (
          objKeywordData,
          index
        ) {
          return objKeywordData.Competition < parseFloat(competitionMax);
        });
      }

      // if(monthStart != ""){

      //   for(var i=0; i<this.keywordData.length; i++){

      //     let monthStartIndex: number = this.keywordData[i].Xaxis.indexOf(monthStart);
      //     this.keywordData[i].Xaxis = this.keywordData[i].Xaxis.splice(monthStartIndex);
      //     this.keywordData[i].Yaxis = this.keywordData[i].Yaxis.splice(monthStartIndex);
      //   }
      // }

      // if(monthEnd != ""){
      //   for(var i=0; i<this.keywordData.length; i++){
      //     let monthEndIndex: number = (this.keywordData[i].Xaxis.indexOf(monthEnd)) + 1;
      //     this.keywordData[i].Xaxis = this.keywordData[i].Xaxis.splice(0, monthEndIndex);
      //     this.keywordData[i].Yaxis = this.keywordData[i].Yaxis.splice(0, monthEndIndex);
      //   }
      // }

      this.config.totalItems =
        this.keywordData == null ? 0 : this.keywordData.length;
    }
  };

  getMonthIndex = function (strMonthName: string, arryData: any[]) {};
  getLanguages = function () {
    this.languageService.GetLanguages().subscribe(
      (data: LanguageData) => {
        this.languagesList = data;
      },
      (error) => {
        this.showErrorMessage("Languages are not loaded.");
        console.log("Error");
      }
    );
  };
  getLocations = function () {
    this.locationService.GetLocations().subscribe(
      (data) => {
        this.locationList = data;

        //this.uniqueLanguageList = this.locationList.filter(x => { return x.Language});

        this.uniqueLocationList = JSON.parse(JSON.stringify(this.locationList));

        this.uniqueLocationList = this.uniqueLocationList.filter(
          (obj, pos, arr) => {
            return (
              arr.map((mapObj) => mapObj["Name"]).indexOf(obj["Name"]) === pos
            );
          }
        );

        this.uniqueLanguageList = JSON.parse(JSON.stringify(this.locationList));

        this.uniqueLanguageList = this.uniqueLanguageList.filter(
          (obj, pos, arr) => {
            return (
              arr
                .map((mapObj) => mapObj["Language"])
                .indexOf(obj["Language"]) === pos
            );
          }
        );

        this.uniqueLanguageList = this.uniqueLanguageList.sort((a, b) =>
          a.Language.localeCompare(b.Language)
        );
        this.getStates(
          this.locationList.filter(({ Name }) => Name == "United States")[0]
            .CCLC
        );
      },
      (error) => {
        this.showErrorMessage("Locations are not loaded.");
        console.log("Error");
      }
    );
  };

  getStates = function (event: any, isCities: boolean = false) {
    this.locationService.GetStates(event.split("/")[0]).subscribe(
      (data) => {
        console.log(data);
        if (isCities) {
          this.cityList = data.cities;
        } else this.stateList = data.cities;
      },
      (error) => {
        this.showErrorMessage("States/Cities are not loaded.");
        console.log("Error");
      }
    );
  };

  setTab = function (newTab) {
    this.tab = newTab;
  };

  isSet = function (tabNum) {
    return this.tab === tabNum;
  };

  onPickKeyword = function (event) {
    var objButton = event.target;
    var objRow = objButton.parentElement.parentElement;
    var objFirstTD = objRow.cells[0];
    var strText = objFirstTD
      .getElementsByClassName("form-check-label")[0]
      .innerHTML.trim();

    if (objButton.innerHTML.toLowerCase() == "pick") {
      objButton.innerHTML = "Picked";
      objRow.style.backgroundColor = "#fbf2f2";
      this.pickedKeywordsInput.push(strText);
    } else {
      objButton.innerHTML = "Pick";
      objRow.style.backgroundColor = "white";
      this.removeItemFromArray(strText);
    }
  };

  removeItemFromArray = function (stringValue: string) {
    for (var i = 0; i < this.pickedKeywordsInput.length; i++) {
      if (this.pickedKeywordsInput[i] === stringValue) {
        this.pickedKeywordsInput.splice(i, 1);
      }
    }
  };
  showHideGraph(intIndex: number) {
    var trControl = document.getElementById("trGraph" + intIndex);

    if (trControl.style.display == "") {
      trControl.style.display = "none";
    } else {
      trControl.style.display = "";

      var objData = this.keywordData.filter(function (objKeywordData, index) {
        return objKeywordData.ID === intIndex;
      })[0];

      this.renderChart(
        "canvas" + intIndex,
        objData.Xaxis,
        objData.Yaxis,
        this.getLegendSummary(objData.Ternd),
        "divInfo" + intIndex
      );
    }
  }
  showHideRelatedKeywordGraph(intIndex: number) {
    var trControl = document.getElementById("trRelatedKeywordGraph" + intIndex);

    if (trControl.style.display == "") {
      trControl.style.display = "none";
    } else {
      trControl.style.display = "";

      var objData = this.relatedKeywordDate.filter(function (
        objKeywordData,
        index
      ) {
        return objKeywordData.ID === intIndex;
      })[0];

      this.renderChart(
        "canvasRelatedKeyword" + intIndex,
        objData.Xaxis,
        objData.Yaxis,
        this.getLegendSummary(objData.Ternd),
        "divInfoRelatedKeyword" + intIndex
      );
    }
  }
  onSearch(
    searchTerm: string,
    searchLanguageID: string,
    searchLocationID: string,
    goodSearchNetwork: string,
    state: string
  ) {
    let strConcatenatedValue: string =
      searchLocationID + "/" + searchLanguageID;
    let strNegativeKeywords: string = (
      document.getElementById("txtNegativeKeywords") as HTMLInputElement
    ).value;
    this.onClickMe(
      searchTerm,
      goodSearchNetwork,
      strConcatenatedValue,
      state,
      strNegativeKeywords,
      false,
      this.pageToken
    );
  }
  onEnter(event) {
    if (event.key === "Enter") {
      let strNegativeKeywords: string = (
        document.getElementById("txtNegativeKeywords") as HTMLInputElement
      ).value;

      let ddlGoogleState = (
        document.getElementById("selStateGoogle") as HTMLInputElement
      )?.value;

      console.log("event", event);
      console.log("event value", event.target.value);
      console.log("state", ddlGoogleState);
      console.log("keywords", strNegativeKeywords);

      this.onClickMe(
        event.target.value,
        "0",
        this.languageSelectedValue,
        ddlGoogleState,
        strNegativeKeywords,
        false,
        ""
      );
      return false;
    }
  }
  onClickMe(
    searchTerm: string,
    googleSearchNetwork: string,
    languageConcatenatedValue: string,
    state: string,
    strNegativekeywords: string,
    blnIsRefineSearch: boolean,
    pageToken: string = "",
    city: string = null,
    isRecursiveCall: boolean = false
  ) {
    if (searchTerm.trim() != "") {
      this.keywordData = !isRecursiveCall ? [] : this.keywordData;
      var arrayCodes = languageConcatenatedValue.split("/");
      let targetGoogleSearch: string = "true";
      let targetGoogleNetworkSearch: string = "false";
      //this.questionsData = [];
      let objType2Data: Type2Data;

      let strNegativeKeywords: string = (
        document.getElementById("txtNegativeKeywords") as HTMLInputElement
      ).value;

      if (googleSearchNetwork == "1") {
        targetGoogleNetworkSearch = "true";
      }

      let txtGoogleSaerchVolumeMin = document.getElementById(
        "txtGoogleSaerchVolumeMin"
      ) as HTMLInputElement;
      let txtGoogleSaerchVolumeMax = document.getElementById(
        "txtGoogleSaerchVolumeMax"
      ) as HTMLInputElement;
      // let txtGoogleCPCMin = ((document.getElementById("txtGoogleCPCMin") as HTMLInputElement));
      // let txtGoogleCPCMax = ((document.getElementById("txtGoogleCPCMax") as HTMLInputElement));
      let txtGoogleCompetitionMin = document.getElementById(
        "txtGoogleCompetitionMin"
      ) as HTMLInputElement;
      let txtGoogleCompetitionMax = document.getElementById(
        "txtGoogleCompetitionMax"
      ) as HTMLInputElement;
      let ddlIncludeChartData = document.getElementById(
        "ddlIncludeChartData"
      ) as HTMLInputElement;

      let ddlGoogleLocation = document.getElementById(
        "ddlGoogleLocation"
      ) as HTMLInputElement;
      let ddlGoogleState = state; //((document.getElementById("selStateGoogle") as HTMLInputElement));
      let ddlGoogleCity = city; //((document.getElementById("selStateGoogle") as HTMLInputElement));
      let ddlGoogleLanguage = document.getElementById(
        "ddlGoogleLanguage"
      ) as HTMLInputElement;
      let ddlGoogleSearchNetwork = document.getElementById(
        "ddlGoogleSearchNetwork"
      ) as HTMLInputElement;
      let txtNegativeKeywords = document.getElementById(
        "txtNegativeKeywords"
      ) as HTMLInputElement;

      if (isRecursiveCall == false) {
        document.getElementById("waisaydiv").style.display = "";
      }

      let strSearchVolumeMin: string = txtGoogleSaerchVolumeMin.value;
      let strSearchVolumeMax: string = txtGoogleSaerchVolumeMax.value;
      let strCPCMin: string = "0";
      let strCPCMax: string = "100000";
      let strCompetitionMin: string = txtGoogleCompetitionMin.value;
      let strCompetitionMax: string = txtGoogleCompetitionMax.value;
      let strInCludeChartData: string = ddlIncludeChartData.value;
      if (blnIsRefineSearch == false) {
        txtGoogleSaerchVolumeMin.value = "";
        txtGoogleSaerchVolumeMax.value = "";
        // txtGoogleCPCMin.value = "";
        // txtGoogleCPCMax.value = "";
        txtGoogleCompetitionMin.value = "";
        txtGoogleCompetitionMax.value = "";
        //ddlGoogleLocation.value="2840";
        //ddlGoogleLanguage.value="1000";
        //ddlGoogleLanguage.text = "English";
        this.selectDropDownByText(ddlGoogleLocation, "United States");
        this.selectDropDownByText(ddlGoogleLanguage, "English");
        ddlGoogleSearchNetwork.value = "0";
        txtNegativeKeywords.value = "";
      }

      // this.ks.getSearchKeywordInfo(searchTerm, arrayCodes[1] as any, arrayCodes[0] as any, targetGoogleSearch, targetGoogleNetworkSearch,
      //   strNegativekeywords, true, strSearchVolumeMin, strSearchVolumeMax, strCPCMin, strCPCMax,
      //   strCompetitionMin, strCompetitionMax, (strInCludeChartData == "0" ? false : true)).subscribe((data: Type2Data) => {
      //     console.log("Keyword Data Before Concat", this.keywordData);
      //     this.keywordData.splice(0, 0 , data[0]);
      //     console.log("Keyword Data After Contact", this.keywordData);
      //   });

      // this.ks.getSearchKeywordInfo(searchTerm, arrayCodes[1] as any, arrayCodes[0] as any, targetGoogleSearch, targetGoogleNetworkSearch,
      //   strNegativekeywords, true, strSearchVolumeMin, strSearchVolumeMax, strCPCMin, strCPCMax,
      //   strCompetitionMin, strCompetitionMax, (strInCludeChartData == "0" ? false : true), true).subscribe((data: Type2Data) => {

      this.ks
        .getKeywords(
          searchTerm,
          arrayCodes[1] as any,
          arrayCodes[0] as any,
          targetGoogleSearch,
          targetGoogleNetworkSearch,
          strNegativekeywords,
          true,
          strSearchVolumeMin,
          strSearchVolumeMax,
          strCPCMin,
          strCPCMax,
          strCompetitionMin,
          strCompetitionMax,
          strInCludeChartData != "on" ? false : true,
          true,
          this.wordCount,
          ddlGoogleState,
          ddlGoogleCity,
          pageToken
        )
        .subscribe(
          (data: Type2Data) => {
            console.log("api data", data);
            console.log("token from db", data.PageToken);
            this.pageToken = data.PageToken;
            this.gridModelList = !isRecursiveCall
              ? data.GridModelListRelevant
              : [...this.gridModelList, ...data.GridModelListRelevant];
            //console.log(objSearchKeywordData);
            this.keywordData = !isRecursiveCall ? [] : this.keywordData;
            this.prepData = !isRecursiveCall ? [] : this.prepData;
            this.questionsData = !isRecursiveCall ? [] : this.questionsData;

            //var intRowId = Math.floor(Math.random() * data.GridModelListRelevant.length) + 3;
            for (var i = 0; i < data.GridModelListRelevant.length; i++) {
              this.keywordData.push(data.GridModelListRelevant[i]);
            }

            // if(data.GridModelListRelevant.length != 0){
            //   let objKeywordData = JSON.parse(JSON.stringify(this.keywordData[intRowId]));
            //   objKeywordData.KeywordText = searchTerm;
            //   this.keywordData.splice(0, 0, objKeywordData);
            // }
            // else{

            // }

            this.fullKeywordData = JSON.parse(JSON.stringify(this.keywordData));
            let dataGridModel: GridBarModel = new GridBarModel();
            dataGridModel.Xaxis = new Array(12).fill(0);
            dataGridModel.Yaxis = new Array(12).fill(0);
            if (isRecursiveCall) {
              dataGridModel.AverageCompetition =
                this.gridModelList.reduce(
                  (acc, item) => acc + item.Competition,
                  0
                ) / this.gridModelList.length;
              if (this.gridModelList.length > 0) {
                for (let j = 0; j < this.gridModelList[0].Xaxis.length; j++) {
                  dataGridModel.Xaxis[j] = this.gridModelList[0].Xaxis[j];
                }
                for (let j = 0; j < this.gridModelList.length; j++) {
                  for (let i = 0; i < 12; i++) {
                    dataGridModel.Yaxis[i] += this.gridModelList[j].Yaxis[i];
                  }
                }
                let arr1 = this.keywordUtilService.toRunningSum(
                  dataGridModel.Yaxis
                );
                let monthArray = this.keywordUtilService.toMonthArray(
                  dataGridModel.Xaxis
                );
                let arr2 = this.keywordUtilService.toRunningAvg(
                  arr1,
                  monthArray
                );
                let arr3 = this.keywordUtilService.toRunningPercentGain(
                  dataGridModel.Yaxis,
                  arr2
                );
                dataGridModel.TotalTernd = `${arr3[arr3.length - 1]} %`;
                dataGridModel.TotalSearchVolume = this.gridModelList.reduce(
                  (sum, currentModel) => sum + currentModel.SearchVolume,
                  0
                );
                this.GridBarModel = dataGridModel;
              }
            } else {
              this.GridBarModel = data.GridBarModel;
            }
            this.config.totalItems =
              this.keywordData == null ? 0 : this.keywordData.length;
            this.config.currentPage =
              isRecursiveCall == false ? 1 : this.config.currentPage;

            this.searchParam = searchTerm;

            //this.relatedKeywordDate = data.GridModelListRelated;
            //this.lcRelatedKeywords = data.GridModelListRelated;
            this.relatedKeywordDate = !isRecursiveCall
              ? data.GridModelListRelated
              : data.GridModelListRelevant.length > 0
              ? [...this.relatedKeywordDate, ...data.GridModelListRelated]
              : this.relatedKeywordDate;
            this.relatedKeywordConfig.totalItems =
              this.relatedKeywordDate == null
                ? 0
                : this.relatedKeywordDate.length;
            this.relatedKeywordConfig.currentPage =
              isRecursiveCall == false
                ? 1
                : this.relatedKeywordConfig.currentPage;

            data.Questions.forEach((strKeyword) => {
              this.questionsData.push(
                data.GridModel.find((x) => x.KeywordText == strKeyword)
              );
            });

            this.questionConfig.totalItems =
              this.questionsData == null ? 0 : this.questionsData.length;
            this.questionConfig.currentPage =
              isRecursiveCall == false ? 1 : this.questionConfig.currentPage;

            data.Prepositions.forEach((strKeyword) => {
              this.prepData.push(
                data.GridModel.find((x) => x.KeywordText == strKeyword)
              );
            });

            this.prepConfig.totalItems =
              this.prepData == null ? 0 : this.prepData.length;
            this.prepConfig.currentPage =
              isRecursiveCall == false ? 1 : this.prepConfig.currentPage;

            this.tab = !isRecursiveCall ? 1 : this.tab;
            document.getElementById("waisaydiv").style.display = "none";

            if (data.PageToken != "" && this.loadMoreRecords == true) {
              this.onClickMe(
                searchTerm,
                googleSearchNetwork,
                languageConcatenatedValue,
                state,
                strNegativekeywords,
                blnIsRefineSearch,
                this.pageToken,
                city,
                true
              );
            } else if (this.loadMoreRecords == false) {
              this.loadMoreRecords = true;
              this.pageToken = "";
            }
          },
          (error) => {
            //this.showErrorMessage("Daily calls limit has been exceeded, press Search button after 15 seconds.")
            console.log("Error");
          }
        );
    } else {
      //debugger;
      this.showErrorMessage("Enter keyword to search.");
    }
  }

  selectDropDownByText = function (dropdown: any, selectedText: string) {
    for (var i = 0; i < dropdown.options.length; i++) {
      if (dropdown.options[i].text === selectedText) {
        dropdown.selectedIndex = i;
        break;
      }
    }
  };

  stopLoadingMoreRecords() {
    this.loadMoreRecords = false;
    this.pageToken = "";
  }

  formatKeywordText = function (searchKeyword: string, searchString: string) {
    //var strPreString = searchKeyword.split(searchString);
    //return searchKeyword;

    var strRegExp = new RegExp(searchString, "g");
    return searchKeyword.replace(
      strRegExp,
      '<b style="font-weight:bold">' + searchString + "</b>"
    );
  };

  onCopyClipBoard = function () {
    let val = "";

    for (var i = 0; i < this.keywordData.length; i++) {
      val += this.keywordData[i].KeywordText + ",";
      val += this.keywordData[i].SearchVolume + ",";
      val += this.keywordData[i].Ternd + ",";
      val += this.keywordData[i].AverageCPC + ",";
      val +=
        this.keywordData[i].Competition +
        " " +
        this.keywordData[i].CompetitionLabel;
      val += "\n";
    }
    let selBox = document.createElement("textarea");
    selBox.style.position = "fixed";
    selBox.style.left = "0";
    selBox.style.top = "0";
    selBox.style.opacity = "0";
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand("copy");
    document.body.removeChild(selBox);
  };

  changeTab(event) {
    this.tabIndex = event.index;

    if (this.tabIndex === 1) {
      this.relatedKeywordDate = this.lcRelatedKeywords;
    }
  }

  onExportToExcel = function () {
    this.excelService.exportAsExcelFile(this.fullKeywordData, "sample");
    //this.excelService.exportAsExcelFile(this.keywordData, 'sample');
    //this.excelService.exportAsExcelFile(this.pickedKeywordsInput, 'sample');
    // debugger;
    // console.log(this.pickedKeywordsInput);

    // let lstPickedKeywords: KeywordData[] = [];

    // this.pickedKeywordsInput.forEach((value) => {
    //   var objPickedKeywordData =  this.keywordData.filter(function (objKeywordData, index) {
    //     return (objKeywordData.KeywordText === value);
    //   })[0];
    //   lstPickedKeywords.push(objPickedKeywordData);
    // });

    // this.excelService.exportAsExcelFile(lstPickedKeywords, 'sample');
    // console.log(lstPickedKeywords);

    // for(var i=0; i<this.pickedKeywordsInput.length; i++){
    //   var objPickedKeywordData =  this.keywordData.filter(function (objKeywordData, index) {
    //     return (objKeywordData.KeywordText === this.pickedKeywordsInput[i]);
    //   })[0];

    //   lstPickedKeywords.push(objPickedKeywordData)
    //   console.log(lstPickedKeywords);
    // }
  };
  processQuestions = function () {
    let questionsDataString = this.keywordData.map((x) => x.KeywordText);
    this.qpService.getQuestions(JSON.stringify(questionsDataString)).subscribe(
      (data) => {
        data.forEach((strKeyword) => {
          this.questionsData.push(
            this.keywordData.find((x) => x.KeywordText == strKeyword)
          );
        });
        this.questionConfig.totalItems =
          this.questionsData == null ? 0 : this.questionsData.length;
      },
      (error) => {
        //this.showErrorMessage("Daily calls limit has been exceeded, press Search button after 15 seconds.")
        console.log("Error in process questions");
      }
    );
  };

  processPrepositions = function () {
    this.prepData = [];
    let prepKeywordArray = this.keywordData.map((x) => x.KeywordText);
    this.qpService.getPreposition(JSON.stringify(prepKeywordArray)).subscribe(
      (data) => {
        data.forEach((strKeyword) => {
          this.prepData.push(
            this.keywordData.find((x) => x.KeywordText == strKeyword)
          );
        });
        this.prepConfig.totalItems =
          this.prepData == null ? 0 : this.prepData.length;
      },
      (error) => {
        //this.showErrorMessage("Daily calls limit has been exceeded, press Search button after 15 seconds.")
        console.log("Error in process questions");
      }
    );
  };

  pageChanged(event) {
    this.config.currentPage = event;
  }
  pageChangedRelatedKeyword(event) {
    this.relatedKeywordConfig.currentPage = event;
  }

  pageQuestionsChanged(event) {
    this.questionConfig.currentPage = event;
  }

  pagePrepChanged(event) {
    this.prepConfig.currentPage = event;
  }

  showErrorMessage(errorString) {
    this.showErrorParent.emit(errorString);
  }

  formatYValue = function (intValue: number) {
    if (intValue < 1000) return intValue;
    else if (intValue > 1000 && intValue < 1000000)
      return intValue / 1000 + "K";
    else if (intValue > 1000000 && intValue < 1000000000)
      return intValue / 1000000 + "M";
    else return intValue / 1000000000 + "B";
  };
  getLegendColor = function (strTrendValue: string) {
    return strTrendValue.indexOf("-") > -1 ? "#da4527" : "#666";
  };

  getLegendSummary = function (strTrendValue: string) {
    return (
      "( " +
      strTrendValue +
      (strTrendValue.indexOf("-") > -1 ? " decrease " : " increase ") +
      " in last 12 months)"
    );
  };

  getTrendArrow = function (strTrendValue: string) {
    if (strTrendValue == "") return "";
    return (
      (strTrendValue.indexOf("-") > -1
        ? `<i class='fa fa-arrow-down' style='color:red' ></i>`
        : `<i class='fa fa-arrow-up' style='color:green'></i>`) +
      " " +
      strTrendValue
    );
  };
  renderChart(
    chartId: string,
    xAxis: string[],
    yAxis: number[],
    datasetLabel: string,
    divInfoid: string
  ) {
    document.getElementById(divInfoid).innerHTML = datasetLabel;
    var barChart = new Chart(chartId, {
      // type: 'bar',
      type: "line",
      data: {
        labels: xAxis,
        datasets: [
          {
            data: yAxis,
            fill: true,
            backgroundColor: [
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
              "rgba(4, 151, 255, 1)",
            ],
          },
        ],
      },
      options: {
        backgroundColor: "#0497ff",
        legend: {
          display: false,
          // labels: {
          //   fontStyle: 'bold',
          //   fontSize: 14,
          //   fontColor : legendColor,
          // },
        },
        // title:{
        //   display: true,
        //   text: datasetLabel,
        //   position: 'top'
        // },
        scales: {
          xAxes: [
            {
              display: true,
            },
          ],
          yAxes: [
            {
              display: true,
              ticks: {
                callback: function (label, index, labels) {
                  if (label < 1000) return label;
                  else if (label > 1000 && label < 1000000)
                    return label / 1000 + "K";
                  else if (label > 1000000 && label < 1000000000)
                    return label / 1000000 + "M";
                  else return label / 1000000000 + "B";
                },
              },
              scaleLabel: {
                display: true,
                labelString: "1K = 1000, 1M = 1,000,000",
              },
            },
          ],
        },
        tooltips: {
          enabled: true,
          callbacks: {
            label: function (tooltipItem, data) {
              var intValue = tooltipItem.value;
              if (intValue < 1000) intValue = intValue;
              else if (intValue > 1000 && intValue < 1000000)
                intValue = intValue / 1000 + "K";
              else if (intValue > 1000000 && intValue < 1000000000)
                intValue = intValue / 1000000 + "M";
              else intValue = intValue / 1000000000 + "B";

              return intValue;
            },
          },
        },
      },
    });
  }
}
