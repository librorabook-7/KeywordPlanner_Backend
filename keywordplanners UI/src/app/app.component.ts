import {
  Component,
  OnInit,
  OnDestroy,
  ANALYZE_FOR_ENTRY_COMPONENTS,
  Renderer2,
  Inject,
} from "@angular/core";
import { AccountopService } from "./services/accountop.service";
import { AccountModel } from "./models/account.model";
//import { AuthService } from 'angularx-social-login';
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { SocialAuthService, SocialUser } from "@abacritt/angularx-social-login";
import { MetaTagsService } from "./services/metatags.service";
import { Meta } from "@angular/platform-browser";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "Keyword Tool for Google Ads";
  PickedKeyWords: string[] = [];
  isUserLoggedIn: boolean = false;
  emailAddress: string = "";
  accountModel: AccountModel = new AccountModel();
  user: SocialUser;
  loggedIn: boolean;

  private destroyed$ = new Subject();

  constructor(
    private accountService: AccountopService,
    private authService: SocialAuthService,
    private metaTagService: MetaTagsService
  ) {}

  ngOnInit() {
    // this.authService.authState.subscribe((user) => {
    //   debugger
    //   this.user = user;
    //   this.loggedIn = (user != null);
    //   console.log(this.user);
    // });
    this.authService.authState.subscribe((user) => {
      console.log(user);
      if (user && !this.isUserLoggedIn) {
        this.accountModel.EmailAddress = user.email;
        this.accountModel.FirstName = user.firstName;
        this.accountModel.LastName = user.lastName;
        this.accountService
          .signUpSocial(this.accountModel)
          .subscribe((data: any) => {
            debugger;
            this.accountService.setSignIn(true);
            window.location.href = "/";
          });
      }
    });
    this.checkUserIsLoggedIn();
    this.syncMetaTags();
  }

  checkUserIsLoggedIn() {
    debugger;
    this.accountService.checkUserLoggedIn().subscribe((data: any) => {
      data = JSON.parse(data);
      if (data.UserInfo == null) {
        this.isUserLoggedIn = false;
       //this.accountService.setSignIn(false);
      } else {
        this.isUserLoggedIn = true;
        this.emailAddress = data.UserInfo[0].EmailAddress;
       //this.accountService.setSignIn(true);
      }
      //
    });
  }

  onLogout() {
    this.accountService.logOff().subscribe(() => {
      this.authService.signOut(true);
      window.location.href = "/";
    });
  }

  syncMetaTags() {
    this.metaTagService.syncMetaTags().subscribe((res: any) => {});
  }
}
