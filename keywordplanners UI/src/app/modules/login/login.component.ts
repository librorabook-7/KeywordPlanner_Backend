import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { AccountModel } from "../../models/account.model";
import { AccountopService } from "../../services/accountop.service";
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
} from "@abacritt/angularx-social-login";
//import { AuthService } from "angularx-social-login";
//import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  errorString: string = "";
  showError: boolean = false;
  accountModel: AccountModel = {
    ID: 0,
    FirstName: "",
    LastName: "",
    EmailAddress: "",
    Password: "",
    NewPassword: "",
    Phone: "",
    ConfirmPassword: "",
  };
  @ViewChild("customGoogleBtn") customGoogleBtn: ElementRef;

  constructor(
    private accountService: AccountopService,
    private authService: SocialAuthService
  ) {}

  ngOnInit() {}

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }

  triggerGoogleAction() {
    this.customGoogleBtn.nativeElement
      .querySelector('div[role="button"]')
      .click();
  }

  signInWithFb(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  onLogin() {
    this.accountService.signIn(this.accountModel).subscribe((data: any) => {
      data = JSON.parse(data);
      if (data.LoggedIn) {
        debugger;
        this.accountService.setSignIn(true);

        // this.accountService.SignInStatus.subscribe(c => {
        //   this.SignInStatus = true;
        // });

        window.location.href = "/";
      } else {
        this.accountService.setSignIn(false);
        this.errorString = "Either username or password is incorrect.";
        this.showError = true;
      }
    });
  }

  onRedirect() {
    window.location.href = "/forgotpassword";
  }
}
