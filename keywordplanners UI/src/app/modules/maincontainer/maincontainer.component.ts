import {
  Component,
  OnInit,
  Input,
  Output,
  ViewEncapsulation,
} from "@angular/core";
import { Observable, timer } from "rxjs";
import { AccountopService } from "../../services/accountop.service";

@Component({
  selector: "app-maincontainer",
  templateUrl: "./maincontainer.component.html",
  styleUrls: ["./maincontainer.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class MaincontainerComponent implements OnInit {
  showError: boolean = false;
  errorString: string = "";
  obsTimer: Observable<any>;
  tabIndex: number = 0;
  showKeywordFinder: boolean = true;
  showCompAnalysis: boolean = false;
  showSearchVolume: boolean = false;
  keywordPro: boolean = false;
  customerupport: boolean = false;
  metaTags: boolean = false;
  tab: number = 1;
  showVideoTab: boolean = false;
  showHowToTab: boolean = false;
  blnMainContainerIsUserLoggedIn: boolean = false;
  packages: any;
  constructor(private accountService: AccountopService) {}

  ngOnInit() {
    // this.accountService.checkUserLoggedIn().subscribe((data:any) => {
    //   data = JSON.parse(data);
    //   if(data.UserInfo == null){
    //     //this.isUserLoggedIn = false;
    //     this.accountService.setSignIn(false);
    //   }
    //   else{
    //     //this.isUserLoggedIn = true;
    //     this.accountService.setSignIn(true);
    //   }
    //   //
    // });
  }

  @Input() isUserLoggedIn: boolean;
  showErrorMessage(errorString) {
    this.errorString = errorString;
    this.showError = true;
    this.obsTimer = timer(5000);

    this.obsTimer.subscribe(() => {
      this.showError = false;
    });
  }

  setTab = function (newTab) {
    this.tab = newTab;
  };

  isSet = function (tabNum) {
    return this.tab === tabNum;
  };

  openModal = function () {
    this.showVideoTab = true;
  };

  closeModal = function () {
    this.showVideoTab = false;
  };

  openHowToModal = function () {
    this.showHowToTab = true;
  };

  closeHowToModal = function () {
    this.showHowToTab = false;
  };

  isHowToOpen = function () {
    return this.showHowToTab == true ? "block" : "none";
  };

  isModelOpen = function () {
    return this.showVideoTab == true ? "block" : "none";
  };

  getTabClasses = function (tabNum) {
    if (this.tab === tabNum) return "nav-link active";
    else return "nav-link";
  };

  changeTab(event) {
    console.log(event.index);
    this.tabIndex = event.index;
  }

  showHidePanels(intPanelNo: number) {
    debugger
    if (intPanelNo == 1) {
      // Keyword Finder
      this.showKeywordFinder = true;
      this.showSearchVolume = false;
      this.showCompAnalysis = false;
      this.keywordPro = false;
      this.customerupport = false;
      this.metaTags = false;
    } else if (intPanelNo == 2) {
      // Comp Analysis
      this.showKeywordFinder = false;
      this.showSearchVolume = false;
      this.keywordPro = false;
      this.customerupport = false;
      this.showCompAnalysis = true;
      this.metaTags = false;
    } else if (intPanelNo == 3) {
      // Search Volume
      this.showKeywordFinder = false;
      this.showSearchVolume = true;
      this.showCompAnalysis = false;
      this.keywordPro = false;
      this.customerupport = false;
      this.metaTags = false;
    } else if (intPanelNo == 4) {
      // keyword pro
      this.showKeywordFinder = false;
      this.showSearchVolume = false;
      this.showCompAnalysis = false;
      this.keywordPro = true;
      this.customerupport = false;
      this.metaTags = false;
    } else if (intPanelNo == 5) {
      // customer support
      this.showKeywordFinder = false;
      this.showSearchVolume = false;
      this.showCompAnalysis = false;
      this.keywordPro = false;
      this.metaTags = false;
      this.customerupport = true;
    } else if (intPanelNo == 6) {
      // customer support
      this.showKeywordFinder = false;
      this.showSearchVolume = false;
      this.showCompAnalysis = false;
      this.keywordPro = false;
      this.customerupport = false;
      this.metaTags = true;
    }
  }
}
