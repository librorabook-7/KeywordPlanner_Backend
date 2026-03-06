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
import { KeywordUtilService } from "src/app/services/keyword-util.service";

@Component({
  selector: "app-compkeywordsearch",
  templateUrl: "./compkeywordsearch.component.html",
  styleUrls: ["./compkeywordsearch.component.css"],
})
export class CompkeywordsearchComponent implements OnInit {
  compkeywordData: KeywordData[] = [];
  fullcompKeywordData: KeywordData[] = [];

  CompGridBarModel: GridBarModel;
  Type2Data: Type2Data;
  barchart: [];
  compconfig: any;
  compprepConfig: any;
  compquestionConfig: any;

  collection = { count: 0, data: [] };
  searchParam: string;
  refineSearchPath: string;
  showSearchSection: boolean;
  languagesList: LanguageData[] = [];
  pickedKeywordsInput: string[] = [];
  compquestionsData: KeywordData[] = [];
  compprepData: KeywordData[] = [];
  compLocationList: any[] = [];
  monthList: string[] = [];
  imagePrePath: string = "";
  languageSelectedValue: string = "2840/1000";
  compUniqueLanguageList: any[] = [];
  compUniqueLocationList: any[] = [];
  compTab: number = 1;
  loadMoreRecords: boolean = true;
  pageToken: string = "";
  gridModelList: KeywordData[];

  constructor(
    private ks: KeywordserviceService,
    private languageService: LanguagesService,
    private mdDialog: MatDialog,
    private qpService: QpdataService,
    private googleAuthService: GoogleAuthService,
    private excelService: ExcelServicesService,
    private locationService: LocationService,
    private keywordUtilService: KeywordUtilService
  ) {
    //this.configure();
  }

  @Input() rowIndex: number;
  @Output() showErrorParent = new EventEmitter();

  ngOnInit() {
    this.compconfig = {
      id: "compkeywordPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.compprepConfig = {
      id: "compprepPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.compquestionConfig = {
      id: "compquestionsPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };

    this.imagePrePath = environment.authURL;
    this.refineSearchPath = "fa fa-chevron-up";
    this.showSearchSection = true;
    //this.getLanguages();
    this.getLocations();
    this.onGetMonths();
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
    if (this.fullcompKeywordData.length == 0) {
      this.showErrorMessage("Please search keyword data first.");
    } else if (this.fullcompKeywordData.length > 0) {
      this.compkeywordData = JSON.parse(
        JSON.stringify(this.fullcompKeywordData)
      );

      if (
        searchVolumeMin != "" &&
        Number(searchVolumeMin) != NaN &&
        parseInt(searchVolumeMin) > 0
      ) {
        this.compkeywordData = this.compkeywordData.filter(function (
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
        this.compkeywordData = this.compkeywordData.filter(function (
          objKeywordData,
          index
        ) {
          return objKeywordData.SearchVolume < parseInt(searchVolumeMax);
        });
      }

      if (CPCMin != "" && Number(CPCMin) != NaN && parseFloat(CPCMin) > 0) {
        this.compkeywordData = this.compkeywordData.filter(function (
          objKeywordData,
          index
        ) {
          return objKeywordData.AverageCPC > parseFloat(CPCMin);
        });
      }

      if (CPCMax != "" && Number(CPCMax) != NaN && parseInt(CPCMax) > 0) {
        this.compkeywordData = this.compkeywordData.filter(function (
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
        this.compkeywordData = this.compkeywordData.filter(function (
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
        this.compkeywordData = this.compkeywordData.filter(function (
          objKeywordData,
          index
        ) {
          return objKeywordData.Competition < parseFloat(competitionMax);
        });
      }

      console.log(this.compkeywordData);
      this.compconfig.totalItems =
        this.compkeywordData == null ? 0 : this.compkeywordData.length;
    }
  };

  getMonthIndex = function (strMonthName: string, arryData: any[]) {};
  getLanguages = function () {
    this.languageService.GetLanguages().subscribe(
      (data: LanguageData) => {
        this.compLocationList = data;
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
        this.compLocationList = data;

        this.compUniqueLocationList = JSON.parse(
          JSON.stringify(this.compLocationList)
        );

        this.compUniqueLocationList = this.compUniqueLocationList.filter(
          (obj, pos, arr) => {
            return (
              arr.map((mapObj) => mapObj["Name"]).indexOf(obj["Name"]) === pos
            );
          }
        );

        this.compUniqueLanguageList = this.compLocationList.filter(
          (obj, pos, arr) => {
            return (
              arr
                .map((mapObj) => mapObj["Language"])
                .indexOf(obj["Language"]) === pos
            );
          }
        );

        this.compUniqueLanguageList = this.compUniqueLanguageList.sort((a, b) =>
          a.Language.localeCompare(b.Language)
        );
      },
      (error) => {
        this.showErrorMessage("Locations are not loaded.");
        console.log("Error");
      }
    );
  };

  onPickKeyword = function (event) {
    var objButton = event.target;
    var objRow = objButton.parentElement.parentElement;
    var objFirstTD = objRow.cells[0];
    var strText =
      objFirstTD.getElementsByClassName("form-check-label")[0].innerHTML;

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

      var objData = this.compkeywordData.filter(function (
        objKeywordData,
        index
      ) {
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

  onSearch(
    searchTerm: string,
    searchLanguageID: string,
    searchLocationID: string,
    goodSearchNetwork: string
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
      this.onClickMe(
        event.target.value,
        "0",
        this.languageSelectedValue,
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
    strNegativekeywords: string,
    blnIsRefineSearch: boolean,
    pageToken: string,
    isRecursiveCall: boolean = false
  ) {
    debugger;
    var re =
      /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    let blnIsValidEmail = re.test(String(searchTerm).toLowerCase());

    if (searchTerm.trim() != "") {
      if (blnIsValidEmail == true) {
        var arrayCodes = languageConcatenatedValue.split("/");
        let targetGoogleSearch: string = "true";
        let targetGoogleNetworkSearch: string = "false";

        if (googleSearchNetwork == "1") {
          targetGoogleNetworkSearch = "true";
        }

        let txtGoogleSaerchVolumeMin = document.getElementById(
          "txtGoogleSaerchVolumeMinComp"
        ) as HTMLInputElement;
        let txtGoogleSaerchVolumeMax = document.getElementById(
          "txtGoogleSaerchVolumeMaxComp"
        ) as HTMLInputElement;
        let txtGoogleCompetitionMin = document.getElementById(
          "txtGoogleCompetitionMinComp"
        ) as HTMLInputElement;
        let txtGoogleCompetitionMax = document.getElementById(
          "txtGoogleCompetitionMaxComp"
        ) as HTMLInputElement;
        let ddlIncludeChartData = document.getElementById(
          "ddlIncludeChartDataComp"
        ) as HTMLInputElement;

        let ddlGoogleLocation = document.getElementById(
          "ddlGoogleLocationsComp"
        ) as HTMLInputElement;
        let ddlGoogleLanguage = document.getElementById(
          "ddlGoogleLanguageComp"
        ) as HTMLInputElement;
        let ddlGoogleSearchNetwork = document.getElementById(
          "ddlGoogleSearchNetworkComp"
        ) as HTMLInputElement;
        let txtNegativeKeywords = document.getElementById(
          "txtNegativeKeywordsComp"
        ) as HTMLInputElement;

        if (isRecursiveCall == false) {
          document.getElementById("waisaydiv").style.display = "";
        }

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

        this.ks
          .getCompAnalysis(
            searchTerm,
            arrayCodes[1] as any,
            arrayCodes[0] as any,
            targetGoogleSearch,
            targetGoogleNetworkSearch,
            strNegativekeywords,
            false,
            strSearchVolumeMin,
            strSearchVolumeMax,
            "0",
            "1000000",
            strCompetitionMin,
            strCompetitionMax,
            strInCludeChartData == "0" ? false : true,
            false,
            pageToken
          )
          .subscribe(
            (data: Type2Data) => {
              debugger;
              this.pageToken = data.PageToken;
              console.log("token from db", data.PageToken);

              this.gridModelList = !isRecursiveCall
                ? data.GridModel
                : [...this.gridModelList, ...data.GridModel];

              this.compkeywordData = !isRecursiveCall
                ? []
                : this.compkeywordData;
              this.compprepData = !isRecursiveCall ? [] : this.compprepData;
              this.compquestionsData = !isRecursiveCall
                ? []
                : this.compquestionsData;

              for (var i = 0; i < data.GridModelListRelevant.length; i++) {
                this.compkeywordData.push(data.GridModelListRelevant[i]);
              }

              this.fullcompKeywordData = JSON.parse(
                JSON.stringify(this.compkeywordData)
              );

              this.CompGridBarModel = data.GridBarModel;

              this.compconfig.totalItems =
                this.compkeywordData == null ? 0 : this.compkeywordData.length;
              this.compconfig.currentPage = !isRecursiveCall
                ? 1
                : this.compconfig.currentPage;

              console.log("pagination", this.compconfig);

              this.searchParam = searchTerm;

              data.Questions.forEach((strKeyword) => {
                this.compquestionsData.push(
                  data.GridModel.find((x) => x.KeywordText == strKeyword)
                );
              });
              this.compquestionConfig.totalItems =
                this.compquestionsData == null
                  ? 0
                  : this.compquestionsData.length;
              this.compquestionConfig.currentPage = !isRecursiveCall
                ? 1
                : this.compquestionConfig.currentPage;

              data.Prepositions.forEach((strKeyword) => {
                this.compprepData.push(
                  data.GridModel.find((x) => x.KeywordText == strKeyword)
                );
              });

              this.compprepConfig.totalItems =
                this.compprepData == null ? 0 : this.compprepData.length;
              this.compprepConfig.currentPage = !isRecursiveCall
                ? 1
                : this.compprepConfig.currentPage;

              this.compTab = !isRecursiveCall ? 1 : this.compTab;

              document.getElementById("waisaydiv").style.display = "none";

              if (data.PageToken != "" && this.loadMoreRecords == true) {
                this.onClickMe(
                  searchTerm,
                  googleSearchNetwork,
                  languageConcatenatedValue,
                  strNegativekeywords,
                  blnIsRefineSearch,
                  this.pageToken,
                  true
                );
              } else if (this.loadMoreRecords == false) {
                this.loadMoreRecords = true;
                this.pageToken = "";
              }
            },
            (error) => {
              console.log("Error");
            }
          );
      } else {
        this.showErrorMessage("Please Enter valid URL to search.");
      }
    } else {
      //debugger;
      this.showErrorMessage("Enter URL to search.");
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

  setTab = function (newTab) {
    this.compTab = newTab;
  };

  isSet = function (tabNum) {
    return this.compTab === tabNum;
  };

  onCopyClipBoard = function () {
    let val = "";

    for (var i = 0; i < this.compkeywordData.length; i++) {
      val += this.compkeywordData[i].KeywordText + ",";
      val += this.compkeywordData[i].SearchVolume + ",";
      val += this.compkeywordData[i].Ternd + ",";
      val += this.compkeywordData[i].AverageCPC + ",";
      val +=
        this.compkeywordData[i].Competition +
        " " +
        this.compkeywordData[i].CompetitionLabel;
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
    this.excelService.exportAsExcelFile(this.compkeywordData, "sample");
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
        console.log("Question Data");
        console.log(this.questionsData);
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
        console.log("Prep Data");
        console.log(this.prepData);
      },
      (error) => {
        //this.showErrorMessage("Daily calls limit has been exceeded, press Search button after 15 seconds.")
        console.log("Error in process questions");
      }
    );
  };

  pageChanged(event) {
    this.compconfig.currentPage = event;
  }

  pageQuestionsChanged(event) {
    this.compquestionConfig.currentPage = event;
  }

  pagePrepChanged(event) {
    this.compprepConfig.currentPage = event;
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
      type: "bar",
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
