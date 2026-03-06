import { Component, OnInit, Input } from '@angular/core';
import { GridBarModel } from 'src/app/models/KeywordData';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-summary-info',
  templateUrl: './summary-info.component.html',
  styleUrls: ['./summary-info.component.css']
})
export class SummaryInfoComponent implements OnInit {

  constructor() { }
  @Input() GridBarModelInput : GridBarModel;
  @Input() SearchTerm : string;
  @Input() KeyWordDataLength: number;
  @Input() HideSummaryInfo: boolean;
  @Input() CanSummaryId: string;
  ngOnInit() {
    
  }

  ngOnChanges (){
    
    if(this.GridBarModelInput != null && this.GridBarModelInput != undefined){
      //this.renderChart("canChartSummary", this.GridBarModelInput.Xaxis, this.GridBarModelInput.Yaxis, this.getLegendSummary(this.GridBarModelInput.TotalTernd), "divChartMainInfo");

      this.renderChart(this.CanSummaryId + "canvas", this.GridBarModelInput.Xaxis, this.GridBarModelInput.Yaxis, this.getLegendSummary(this.GridBarModelInput.TotalTernd), this.CanSummaryId + "ChartMainInfo");
    }
  }


  getTrendArrow = function(strTrendValue: string){
    if(strTrendValue == "" || strTrendValue == null)
      return "";
    return (strTrendValue.indexOf("-") > -1 ? `<i class='fa fa-arrow-down' style='color:red' ></i>` : `<i class='fa fa-arrow-up' style='color:green'></i>`) + " " + strTrendValue;
  }
  
  getLegendSummary = function(strTrendValue: string){
    if(this.HideSummaryInfo){
      return ""
    }
    else{
      if(strTrendValue == "" || strTrendValue == null)
        return "";
      return "( " + strTrendValue + (strTrendValue.indexOf("-") > -1 ? " decrease " : " increase ") + " in last 12 months)";
    }
    
  }

  renderChart(chartId: string, xAxis: string[], yAxis: number[], datasetLabel: string, divInfoid: string ){
    document.getElementById(chartId).remove();
    //var divBarChartSummary = document.getElementById("divBarChartSummary");
    var divBarChartSummary = document.getElementById(this.CanSummaryId);
    let canvas = document.createElement('canvas');
    canvas.id = chartId;
    divBarChartSummary.appendChild(canvas)


    document.getElementById(divInfoid).innerHTML = datasetLabel;
    var barChart = new Chart(chartId, {  
      type: 'bar',  
      data: {  
        labels: xAxis,  
        datasets: [  
          {  
            
            data: yAxis,  
            fill: true,
            backgroundColor: [
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
              'rgba(4, 151, 255, 1)',
          ],
          }  
        ]  
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
          xAxes: [{  
            display: true,
          }],  
          yAxes: [{  
            display: true,
            ticks: {
              callback: function(label, index, labels) {
                if(label < 1000)
                  return label;
                else if(label > 1000 && label < 1000000)  
                  return label/1000 + 'K';
                else if(label > 1000000 && label < 1000000000)  
                  return label/1000000 + 'M';
                else  
                  return label/1000000000 + 'B';
              }
            },
            scaleLabel: {
              display: true,
              labelString: '1K = 1000, 1M = 1,000,000'
            }
          }],  
        },
        tooltips: {
          enabled: true,
          callbacks: {
            label: function(tooltipItem, data) {
              var intValue = tooltipItem.value;
              if(intValue < 1000)
                intValue = intValue;
              else if(intValue > 1000 && intValue < 1000000)  
                intValue = intValue/1000 + 'K';
              else if(intValue > 1000000 && intValue < 1000000000)  
                intValue = intValue/1000000 + 'M';
              else  
                intValue = intValue/1000000000 + 'B';
              
              return intValue;
            }
          }
        }  
      }  
    });
  }
}
