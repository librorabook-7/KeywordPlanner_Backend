import { Component, OnInit, Input } from '@angular/core';
import KeywordData from '../../models/KeywordData';



@Component({
  selector: 'app-table-rows',
  templateUrl: './table-rows.component.html',
  styleUrls: ['./table-rows.component.css']
})
export class TableRowsComponent implements OnInit {

  constructor() { }
  @Input() keyword: KeywordData;
  @Input() rowIndex : number;
 
  showHideGraph(intIndex: number){
    var trControl = document.getElementById("trGraph" + intIndex); 

    if(trControl.style.display == "block"){
      trControl.style.display = "none";
    }
    else{
      trControl.style.display = "block";
    }
  }
  ngOnInit() {
    

    var ctx = document.getElementById("trGraph" + this.rowIndex);

    console.log(ctx)


    //var ctx = document.getElementById("trGraph" + this.rowIndex).getElementsByClassName("canvas")[0];
    
    //var strId = "canvas" + this.rowIndex;
    
    //var strId = "canvas";

    // console.log("Row Index" + this.rowIndex);
    // var ctx = document.getElementById("canvas" + this.rowIndex);
    
    // console.log(ctx);
    
    //console.log(ctx);

    //new Chart(strId, {  
      // new Chart(ctx, {  
      //       type: 'bar',  
      //       data: {  
      //         labels: this.keyword.Xaxis,  
      //         datasets: [  
      //           {  
      //             data: this.keyword.Yaxis,  
      //             borderColor: '#3cba9f',  
      //             fill: true  
      //           }  
      //         ]  
      //       },  
      //       options: {  
      //         legend: {  
      //           display: false  
      //         },  
      //         scales: {  
      //           xAxes: [{  
      //             display: true  
      //           }],  
      //           yAxes: [{  
      //             display: true  
      //           }],  
      //         }  
      //       }  
      //     });  
       
  }

}
