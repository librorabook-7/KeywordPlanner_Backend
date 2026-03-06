import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from "@angular/core";

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
import { YtubedataapiService } from "../../services/ytubedataapi.service";
import { ExportToCsv } from "export-to-csv";
import { AccountopService } from "../../services/accountop.service";

@Component({
  selector: "app-ytube",
  templateUrl: "./ytube.component.html",
  styleUrls: ["./ytube.component.css"],
})
export class YtubeComponent implements OnInit {
  keywordData: KeywordData[] = [];
  fullKeywordData: KeywordData[] = [];
  youtubeRelatedKeywordDate: KeywordData[] = [];
  youtubeHashTagData: KeywordData[] = [];
  GridBarModel: GridBarModel;
  Type2Data: Type2Data;
  barchart: [];
  youtubeKeywordConfig: any;
  youtubeQuestionConfig: any;
  youtubePrepConfig: any;
  youtubeRelatedKeywordConfig: any;
  youtubeHashtagConfig: any;
  collection = { count: 0, data: [] };
  searchParam: string;
  refineSearchPath: string;
  showYoutubeSearchSection: boolean;
  languagesList: LanguageData[] = [];
  pickedKeywordsInput: string[] = [];
  youtubeQuestionsData: KeywordData[] = [];
  youtubePrepData: KeywordData[] = [];
  youtubeLocationList: any[] = [];
  stateList: any[] = [];
  cityList: any[] = [];
  monthList: string[] = [];
  youtubeImagePrePath: string = "";
  youtubeLanguageSelectedValue: string = "2840/1000";
  uniqueYoutubeLanguageList: any[] = [];
  uniqueYoutubeLocationList: any[] = [];
  tab: number = 1;
  blnIsYoutubeUserLogged: boolean = false;
  pageToken: string = "";
  gridModelList: KeywordData[];
  unpaidResultCount: number = 10;
  loadMoreRecords: boolean = true;

  constructor(
    private yt: YtubedataapiService,
    private languageService: LanguagesService,
    private mdDialog: MatDialog,
    private qpService: QpdataService,
    private googleAuthService: GoogleAuthService,
    private excelService: ExcelServicesService,
    private locationService: LocationService,
    private accountService: AccountopService
  ) {}

  @Input() rowIndex: number;
  @Output() showErrorParent = new EventEmitter();

  ngOnInit() {
    this.youtubeKeywordConfig = {
      id: "youtubekeywordPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.youtubeQuestionConfig = {
      id: "youtubeQuestionsPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.youtubePrepConfig = {
      id: "youtubePrepPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.youtubeRelatedKeywordConfig = {
      id: "relatedKeywordYoutubePaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.youtubeHashtagConfig = {
      id: "hashtagYoutubePaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.youtubeImagePrePath = environment.authURL;
    this.refineSearchPath = "fa fa-chevron-up";
    this.showYoutubeSearchSection = true;
    //this.getLanguages();
    this.getLocations();
    this.onGetMonths();

    this.accountService.checkUserLoggedIn().subscribe((data: any) => {
      data = JSON.parse(data);
      if (data.UserInfo == null) {
        //this.isUserLoggedIn = false;
        this.blnIsYoutubeUserLogged = false;
        this.accountService.setSignIn(false);
      } else {
        //this.isUserLoggedIn = true;
        this.blnIsYoutubeUserLogged = true;
        this.accountService.setSignIn(true);
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

  removeLocalStorage = function () {
    //localStorage.removeItem("comp");
    localStorage.removeItem("pickedkeywords");
    localStorage.removeItem("statechanged");
  };

  onYoutubeShowHideSearchPanel = function (event) {
    event.stopPropagation();
    if (this.refineSearchPath.indexOf("fa fa-chevron-down") > -1) {
      this.refineSearchPath = "fa fa-chevron-up";
      this.showYoutubeSearchSection = true;
    } else {
      this.refineSearchPath = "fa fa-chevron-down";
      this.showYoutubeSearchSection = false;
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

      if (CPCMin != "" && Number(CPCMin) != NaN && parseFloat(CPCMin) > 0) {
        this.keywordData = this.keywordData.filter(function (
          objKeywordData,
          index
        ) {
          return objKeywordData.AverageCPC > parseFloat(CPCMin);
        });
      }

      if (CPCMax != "" && Number(CPCMax) != NaN && parseInt(CPCMax) > 0) {
        this.keywordData = this.keywordData.filter(function (
          objKeywordData,
          index
        ) {
          return objKeywordData.AverageCPC < parseFloat(CPCMax);
        });
      }

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

      this.youtubeKeywordConfig.totalItems =
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

  setTab = function (newTab) {
    this.tab = newTab;
  };

  isSet = function (tabNum) {
    return this.tab === tabNum;
  };

  getLocations = function () {
    this.locationService.GetLocations().subscribe(
      (data) => {
        this.youtubeLocationList = data;

        this.uniqueYoutubeLocationList = JSON.parse(
          JSON.stringify(this.youtubeLocationList)
        );

        this.uniqueYoutubeLocationList = this.uniqueYoutubeLocationList.filter(
          (obj, pos, arr) => {
            return (
              arr.map((mapObj) => mapObj["Name"]).indexOf(obj["Name"]) === pos
            );
          }
        );

        this.uniqueYoutubeLanguageList = JSON.parse(
          JSON.stringify(this.youtubeLocationList)
        );

        this.uniqueYoutubeLanguageList = this.youtubeLocationList.filter(
          (obj, pos, arr) => {
            return (
              arr
                .map((mapObj) => mapObj["Language"])
                .indexOf(obj["Language"]) === pos
            );
          }
        );

        this.uniqueYoutubeLanguageList = this.uniqueYoutubeLanguageList.sort(
          (a, b) => a.Language.localeCompare(b.Language)
        );
        this.getStates(
          this.youtubeLocationList.filter(
            ({ Name }) => Name == "United States"
          )[0].CCLC
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
        if (isCities) {
          this.cityList = data.cities;
        } else this.stateList = data.cities;
      },
      (error) => {
        this.showErrorMessage("States are not loaded.");
        console.log("Error");
      }
    );
  };

  showHideGraph(intIndex: number) {
    var trControl = document.getElementById("trYoutubeGraph" + intIndex);

    if (trControl.style.display == "") {
      trControl.style.display = "none";
    } else {
      trControl.style.display = "";

      var objData = this.keywordData.filter(function (objKeywordData, index) {
        return objKeywordData.ID === intIndex;
      })[0];

      this.renderChart(
        "canvasYoutube" + intIndex,
        objData.Xaxis,
        objData.Yaxis,
        this.getLegendSummary(objData.Ternd),
        "divInfoYoutube" + intIndex
      );
    }
  }

  showHideYoutubeRelatedKeywordGraph(intIndex: number) {
    var trControl = document.getElementById(
      "trRelatedKeywordGraphYoutube" + intIndex
    );

    if (trControl.style.display == "") {
      trControl.style.display = "none";
    } else {
      trControl.style.display = "";

      var objData = this.youtubeRelatedKeywordDate.filter(function (
        objKeywordData,
        index
      ) {
        return objKeywordData.ID === intIndex;
      })[0];

      this.renderChart(
        "canvasRelatedKeywordYoutube" + intIndex,
        objData.Xaxis,
        objData.Yaxis,
        this.getLegendSummary(objData.Ternd),
        "divInfoRelatedKeywordYoutube" + intIndex
      );
    }
  }

  // onSearch(searchTerm: string, searchLanguageID: string, searchLocationID: string, goodSearchNetwork: string){
  //   let strConcatenatedValue : string = searchLocationID + "/" + searchLanguageID;
  //   let strNegativeKeywords: string = ((document.getElementById("txtYoutubeNegativeKeywords") as HTMLInputElement).value);
  //   this.onClickMe(searchTerm, goodSearchNetwork, strConcatenatedValue, strNegativeKeywords, false);
  // }
  onEnter(event) {
    if (event.key === "Enter") {
      let strNegativeKeywords: string = (
        document.getElementById(
          "txtYoutubeNegativeKeywords"
        ) as HTMLInputElement
      ).value;
      let selStateYoutube: string = (
        document.getElementById("selStateYoutube") as HTMLInputElement
      ).value;
      this.onClickMe(
        event.target.value,
        "0",
        this.youtubeLanguageSelectedValue,
        selStateYoutube,
        strNegativeKeywords,
        false
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
      var arrayCodes = languageConcatenatedValue.split("/");
      let targetGoogleSearch: string = "true";
      let targetGoogleNetworkSearch: string = "false";
      //this.questionsData = [];

      if (googleSearchNetwork == "1") {
        targetGoogleNetworkSearch = "true";
      }
      debugger;

      this.yt.getAutoSuggestions(searchTerm, state).subscribe(
        (data: any) => {
          let txtGoogleSaerchVolumeMin = document.getElementById(
            "txtGoogleSaerchVolumeMinYoutube"
          ) as HTMLInputElement;
          let txtGoogleSaerchVolumeMax = document.getElementById(
            "txtGoogleSaerchVolumeMaxYoutube"
          ) as HTMLInputElement;

          let txtGoogleCompetitionMin = document.getElementById(
            "txtGoogleCompetitionMinYoutube"
          ) as HTMLInputElement;
          let txtGoogleCompetitionMax = document.getElementById(
            "txtGoogleCompetitionMaxYoutube"
          ) as HTMLInputElement;
          let ddlIncludeChartData = document.getElementById(
            "ddlIncludeChartDataYoutbe"
          ) as HTMLInputElement;

          let ddlGoogleLocation = document.getElementById(
            "ddlGoogleLocationsYoutube"
          ) as HTMLInputElement;
          let ddlGoogleLanguage = document.getElementById(
            "ddlGoogleLanguageYoube"
          ) as HTMLInputElement;
          let ddlGoogleSearchNetwork = document.getElementById(
            "ddlGoogleSearchNetworkYoutube"
          ) as HTMLInputElement;
          let txtNegativeKeywords = document.getElementById(
            "txtYoutubeNegativeKeywords"
          ) as HTMLInputElement;

          if (isRecursiveCall == false) {
            document.getElementById("waisaydiv").style.display = "";
          } else document.getElementById("waisaydiv").style.display = "none";

          let strSearchVolumeMin: string = txtGoogleSaerchVolumeMin.value;
          let strSearchVolumeMax: string = txtGoogleSaerchVolumeMax.value;

          let strCompetitionMin: string = txtGoogleCompetitionMin.value;
          let strCompetitionMax: string = txtGoogleCompetitionMax.value;
          let strInCludeChartData: string = ddlIncludeChartData.value;

          if (blnIsRefineSearch == false) {
            txtGoogleSaerchVolumeMin.value = "";
            txtGoogleSaerchVolumeMax.value = "";

            txtGoogleCompetitionMin.value = "";
            txtGoogleCompetitionMax.value = "";
            //ddlGoogleLocation.value="2840";
            //ddlGoogleLanguage.value="1000";
            this.selectDropDownByText(ddlGoogleLocation, "United States");
            this.selectDropDownByText(ddlGoogleLanguage, "English");
            ddlGoogleSearchNetwork.value = "0";
            txtNegativeKeywords.value = "";
          }

          this.yt
            .getKeywords(
              searchTerm + "," + data[1].toString(),
              arrayCodes[1] as any,
              arrayCodes[0] as any,
              targetGoogleSearch,
              targetGoogleNetworkSearch,
              "",
              true,
              strSearchVolumeMin,
              strSearchVolumeMax,
              "0",
              "100000",
              strCompetitionMin,
              strCompetitionMax,
              strInCludeChartData != "on" ? false : true,
              state,
              city,
              pageToken
            )
            .subscribe(
              (data: any) => {
                this.keywordData = !isRecursiveCall ? [] : this.keywordData;
                document.getElementById("waisaydiv").style.display = "none";
                //this.keywordData = data.Result.GridModel;
                this.pageToken = data.Result.PageToken;

                //this.keywordData = data.Result;

                this.youtubeQuestionsData = !isRecursiveCall
                  ? []
                  : this.youtubeQuestionsData;
                this.youtubePrepData = !isRecursiveCall
                  ? []
                  : this.youtubePrepData;

                let dataFiltered = data.Result.GridModel.filter(function (
                  objKeywordData,
                  index
                ) {
                  return objKeywordData.KeywordText.indexOf(searchTerm) > -1;
                });
                this.keywordData = [...this.keywordData, ...dataFiltered];
                //this.keywordData.push(dataFiltered);

                // data.SuggestionsData.forEach(objSuggestion => {
                //   this.keywordData.push(objSuggestion);
                // });

                this.fullKeywordData = JSON.parse(
                  JSON.stringify(this.keywordData)
                );

                //this.onRefineSearch(strSearchVolumeMin, strSearchVolumeMax, strCPCMin, strCPCMax, strCompetitionMin, strCompetitionMax);

                data.Result.Questions.forEach((strKeyword) => {
                  this.youtubeQuestionsData.push(
                    data.Result.GridModel.find(
                      (x) => x.KeywordText == strKeyword
                    )
                  );
                });

                this.youtubeQuestionConfig.totalItems =
                  this.youtubeQuestionsData == null
                    ? 0
                    : this.youtubeQuestionsData.length;
                this.youtubeQuestionConfig.currentPage = !isRecursiveCall
                  ? 1
                  : this.youtubeQuestionConfig.currentPage;

                data.Result.Prepositions.forEach((strKeyword) => {
                  this.youtubePrepData.push(
                    data.Result.GridModel.find(
                      (x) => x.KeywordText == strKeyword
                    )
                  );
                });
                this.youtubePrepConfig.totalItems =
                  this.youtubePrepData == null
                    ? 0
                    : this.youtubePrepData.length;
                this.youtubePrepConfig.currentPage = !isRecursiveCall
                  ? 1
                  : this.youtubePrepConfig.currentPage;

                this.youtubeRelatedKeywordDate = data.Result.GridModel.filter(
                  function (objKeywordData, index) {
                    return objKeywordData.KeywordText.indexOf(searchTerm) == -1;
                  }
                );

                this.youtubeRelatedKeywordConfig.totalItems =
                  this.youtubeRelatedKeywordDate == null
                    ? 0
                    : this.youtubeRelatedKeywordDate.length;
                this.youtubeRelatedKeywordConfig.currentPage = !isRecursiveCall
                  ? 1
                  : this.youtubeRelatedKeywordConfig.currentPage;

                this.youtubeHashtagConfig.totalItems =
                  this.youtubeHashTagData == null
                    ? 0
                    : this.youtubeHashTagData.length;
                this.youtubeHashtagConfig.currentPage = !isRecursiveCall
                  ? 1
                  : this.youtubeHashtagConfig.currentPage;

                this.GridBarModel = data.Result.GridBarModel;
                this.youtubeKeywordConfig.totalItems =
                  this.keywordData == null ? 0 : this.keywordData.length;
                this.youtubeKeywordConfig.currentPage = !isRecursiveCall
                  ? 1
                  : this.youtubeKeywordConfig.currentPage;

                this.searchParam = searchTerm;
                debugger;
                this.tab = !isRecursiveCall ? 1 : this.tab;

                if (
                  data.Result.PageToken != "" &&
                  this.loadMoreRecords == true
                ) {
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

                //this.GridBarModel = undefined;

                //console.log("idea = 2 end");
                //console.log(new Date());
              },
              (error) => {
                //this.showErrorMessage("Daily calls limit has been exceeded, press Search button after 15 seconds.")
                console.log("Error");
              }
            );
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

  stopLoadingMoreRecords() {
    this.loadMoreRecords = false;
  }

  selectDropDownByText = function (dropdown: any, selectedText: string) {
    for (var i = 0; i < dropdown.options.length; i++) {
      if (dropdown.options[i].text === selectedText) {
        dropdown.selectedIndex = i;
        break;
      }
    }
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

  onExportToExcel = function () {
    this.excelService.exportAsExcelFile(this.fullKeywordData, "sample");
  };

  onExportToCSV = function () {
    //console.log(this.keywordData);

    const options = {
      fieldSeparator: ",",
      quoteStrings: '"',
      decimalSeparator: ".",
      showLabels: true,
      showTitle: false,
      title: "",
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
      filename: "output",
      // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };

    let lstCSVKeywordData: any = [];

    this.keywordData.forEach((objKeywordData) => {
      lstCSVKeywordData.push({
        KeywordText: objKeywordData.KeywordText,
        SearchVolume: objKeywordData.SearchVolume,
        Trend: objKeywordData.Ternd,
        CPC: objKeywordData.AverageCPC,
        Competition:
          objKeywordData.Competition +
          " (" +
          objKeywordData.CompetitionLabel +
          ")",
      });
    });

    const csvExporter = new ExportToCsv(options);

    csvExporter.generateCsv(lstCSVKeywordData);
  };

  pageChanged(event) {
    this.youtubeKeywordConfig.currentPage = event;
  }

  youtubePageQuestionsChanged(event) {
    this.youtubeQuestionConfig.currentPage = event;
  }

  youtubePagePrepChanged(event) {
    this.youtubePrepConfig.currentPage = event;
  }

  youtubeHashTagChanged(event) {
    this.youtubeHashtagConfig.currentPage = event;
  }

  pageChangedYoutubeRelatedKeyword(event) {
    this.youtubeRelatedKeywordConfig.currentPage = event;
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

  formatKeywordText = function (searchKeyword: string, searchString: string) {
    //var strPreString = searchKeyword.split(searchString);
    //return searchKeyword;

    var strRegExp = new RegExp(searchString, "g");
    return searchKeyword.replace(
      strRegExp,
      '<b style="font-weight:bold">' + searchString + "</b>"
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
