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

@Component({
  selector: "app-searchvolumekeywordsearch",
  templateUrl: "./searchvolumekeywordsearch.component.html",
  styleUrls: ["./searchvolumekeywordsearch.component.css"],
})
export class SearchvolumekeywordsearchComponent implements OnInit {
  refineSearchPath: string;
  showSearchSection: boolean;
  searchVolumeconfig: any;
  searchVolumekeywordData: KeywordData[] = [];
  locationList: any[] = [];
  uniqueLanguageList: any[] = [];
  searchVolumefullKeywordData: KeywordData[] = [];
  @Output() showErrorParent = new EventEmitter();
  pageToken: string = "";
  gridModelList: KeywordData[];
  loadMoreRecords: boolean = true;

  constructor(
    private ks: KeywordserviceService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.refineSearchPath = "fa fa-chevron-up";
    this.showSearchSection = true;
    this.getLocations();

    this.searchVolumeconfig = {
      id: "searchVolumekeywordPaginationControl",
      itemsPerPage: 15,
      currentPage: 1,
      totalItems: 0,
    };
  }

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

  onEnter(event) {
    if (event.key === "Enter") {
      this.onClickMe(event.target.value, "2840/1000", "");
      return false;
    }
  }

  onClickMe(
    searchTerm: string,
    strLocationLanguageId: string,
    pageToken,
    isRecursiveCall: boolean = false
  ) {
    if (searchTerm.trim() != "") {
      //let blnTargetSearchNetwork =(targetSearchNetwork == "1" ? true : false);

      let lstLocationLanguage = strLocationLanguageId.split("/");

      var objData = {
        Keywords: searchTerm,
        LanguageId: lstLocationLanguage[1],
        LocationId: lstLocationLanguage[0],
        targetGoogleSearch: true,
        targetSearchNetwork: false,
        pageToken: this.pageToken,
      };

      this.ks.getSearchVolumeTabInfo(objData).subscribe(
        (lstSearchData: any) => {
          debugger;
          console.log(lstSearchData);
          //this.searchVolumekeywordData = lstSearchData.gridModel;

          this.searchVolumekeywordData = !isRecursiveCall
            ? lstSearchData.gridModel
            : lstSearchData.gridModel.length > 0
            ? [...this.searchVolumekeywordData, ...lstSearchData.gridModel]
            : this.searchVolumekeywordData;

          this.pageToken = lstSearchData.pageToken;

          this.searchVolumeconfig.totalItems =
            this.searchVolumekeywordData == null
              ? 0
              : this.searchVolumekeywordData.length;
          this.searchVolumeconfig.currentPage = !isRecursiveCall
            ? 1
            : this.searchVolumeconfig.currentPage;
          this.searchVolumefullKeywordData = JSON.parse(
            JSON.stringify(this.searchVolumekeywordData)
          );
          document.getElementById("waisaydiv").style.display = "none";

          if (lstSearchData.pageToken != "" && this.loadMoreRecords == true) {
            this.onClickMe(
              searchTerm,
              strLocationLanguageId,
              this.pageToken,
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

  onRefineSearch = function (
    searchVolumeMin: string,
    searchVolumeMax: string,
    CPCMin: string,
    CPCMax: string,
    competitionMin: string,
    competitionMax: string
  ) {
    debugger;
    if (this.searchVolumefullKeywordData.length == 0) {
      this.showErrorMessage("Please search keyword data first.");
    } else if (this.searchVolumefullKeywordData.length > 0) {
      this.searchVolumekeywordData = JSON.parse(
        JSON.stringify(this.searchVolumefullKeywordData)
      );

      if (
        searchVolumeMin != "" &&
        Number(searchVolumeMin) != NaN &&
        parseInt(searchVolumeMin) > 0
      ) {
        this.searchVolumekeywordData = this.searchVolumekeywordData.filter(
          function (objKeywordData, index) {
            return objKeywordData.SearchVolume > parseInt(searchVolumeMin);
          }
        );
      }

      if (
        searchVolumeMax != "" &&
        Number(searchVolumeMax) != NaN &&
        parseInt(searchVolumeMax) > 0
      ) {
        this.searchVolumekeywordData = this.searchVolumekeywordData.filter(
          function (objKeywordData, index) {
            return objKeywordData.SearchVolume < parseInt(searchVolumeMax);
          }
        );
      }

      if (CPCMin != "" && Number(CPCMin) != NaN && parseFloat(CPCMin) > 0) {
        this.searchVolumekeywordData = this.searchVolumekeywordData.filter(
          function (objKeywordData, index) {
            return objKeywordData.AverageCPC > parseFloat(CPCMin);
          }
        );
      }

      if (CPCMax != "" && Number(CPCMax) != NaN && parseInt(CPCMax) > 0) {
        this.searchVolumekeywordData = this.searchVolumekeywordData.filter(
          function (objKeywordData, index) {
            return objKeywordData.AverageCPC < parseFloat(CPCMax);
          }
        );
      }

      if (
        competitionMin != "" &&
        Number(competitionMin) != NaN &&
        parseFloat(competitionMin) > 0
      ) {
        this.searchVolumekeywordData = this.searchVolumekeywordData.filter(
          function (objKeywordData, index) {
            return objKeywordData.Competition > parseFloat(competitionMin);
          }
        );
      }

      if (
        competitionMax != "" &&
        Number(competitionMax) != NaN &&
        parseFloat(competitionMax) > 0
      ) {
        this.searchVolumekeywordData = this.searchVolumekeywordData.filter(
          function (objKeywordData, index) {
            return objKeywordData.Competition < parseFloat(competitionMax);
          }
        );
      }

      console.log(this.searchVolumekeywordData);
      this.searchVolumeconfig.totalItems =
        this.searchVolumekeywordData == null
          ? 0
          : this.searchVolumekeywordData.length;
      this.searchVolumeconfig.currentPage = 1;
    }
  };
  pageChanged(event) {
    this.searchVolumeconfig.currentPage = event;
  }

  stopLoadingMoreRecords() {
    this.loadMoreRecords = false;
    this.pageToken = "";
  }
  getLocations = function () {
    this.locationService.GetLocations().subscribe(
      (data) => {
        this.locationList = data;

        //this.uniqueLanguageList = this.locationList.filter(x => { return x.Language});

        this.uniqueLanguageList = this.locationList.filter((obj, pos, arr) => {
          return (
            arr.map((mapObj) => mapObj["Language"]).indexOf(obj["Language"]) ===
            pos
          );
        });

        //console.log(this.uniqueLanguageList);
        //console.log(this.locationList);
      },
      (error) => {
        this.showErrorMessage("Locations are not loaded.");
        console.log("Error");
      }
    );
  };

  showSearchVolumeHideGraph(intIndex: number) {
    var trControl = document.getElementById("trGraph" + intIndex);

    if (trControl.style.display == "") {
      trControl.style.display = "none";
    } else {
      trControl.style.display = "";

      var objData = this.searchVolumekeywordData.filter(function (
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

  getLegendSummary = function (strTrendValue: string) {
    return (
      "( " +
      strTrendValue +
      (strTrendValue.indexOf("-") > -1 ? " decrease " : " increase ") +
      " in last 12 months)"
    );
  };

  showErrorMessage(errorString) {
    this.showErrorParent.emit(errorString);
  }
}
