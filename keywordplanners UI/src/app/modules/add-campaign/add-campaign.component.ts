import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DialogData} from '../../models/DialogData';
import { GoogleAuthService } from '../../services/google-auth.service';
import GoogleAdsData from 'src/app/models/gAds';



@Component({
  selector: 'app-add-campaign',
  templateUrl: './add-campaign.component.html',
  styleUrls: ['./add-campaign.component.css']
})
export class AddCampaignComponent implements OnInit {
  pickedKeywordsString : string = "";
  userData: any;
  lstAccounts: [];
  lstCampigns: [];
  lstAdGroups : [];
  GoogleAd1: GoogleAdsData;
  GoogleAd2: GoogleAdsData;
  
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<AddCampaignComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private googleAuthService: GoogleAuthService) {}
  
    //@Output() showErrorParent = new EventEmitter();
  
  ngOnInit() {
    console.log(this.data);
    this.pickedKeywordsString = this.data.PickedKeywords.join();
    this.userData = this.data.UserData;

    this.GoogleAd1 = new GoogleAdsData();
    this.GoogleAd2 = new GoogleAdsData();

    
  }

  

  ngAfterViewInit(){
    this.getUserAccounts();
  }
  
  getUserAccounts = function(){
    this.googleAuthService.getUserAccounts(this.userData).subscribe((data) => {
      this.lstAccounts = data.Hierarchy;
    },
    error => {
      console.log(error);
    });
  }

  getUserCampigns = function(clientCustomId: string){
    //getUserCampaigns
    debugger;
    this.userData.Config.ClientCustomerId = clientCustomId;
    this.googleAuthService.getUserCampaigns(this.userData).subscribe((data) => {
      //this.lstCampigns = data.Hierarchy;
      //console.log(data)
      this.lstCampigns = data;
    },
    error => {
      console.log(error);
    });
  }

  getCampaings = function(event){
    if(event.target.value == "0"){
      this.lstCampigns = [];
    }
    else{
      this.getUserCampigns(event.target.value);
    }
    
  }

  getUserAddGroups = function(event){
    debugger;
    if(event.target.value == "0"){
      this.lstAdGroups = [];
    }
    else{
      this.googleAuthService.getUserAdGroups(this.userData, event.target.value).subscribe((data) => {
        this.lstAdGroups = data;
        console.log(data);
      },
      error => {
        console.log(error);
      });
    }
  }

  onSaveAds = function(adGroupdId: string){
    debugger;
    console.log(this.pickedKeywordsString);


    let objExpandedModeel = {
      User : this.userData,
      AdGroupId: adGroupdId,
      Ads: [],
      Keywords: this.pickedKeywordsString.split(",")
    };

    objExpandedModeel.Ads.push(this.GoogleAd1);
    objExpandedModeel.Ads.push(this.GoogleAd2);
    console.log(objExpandedModeel);

    
    
    this.googleAuthService.createAds(objExpandedModeel).subscribe((data) => {
      console.log(data);
      this.dialogRef.close();
    },
    error => {
      console.log(error);
      //this.data.ShowError("Some error has occurred.");
    });
  }



}
