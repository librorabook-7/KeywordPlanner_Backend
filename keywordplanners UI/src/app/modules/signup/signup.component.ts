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
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from "@angular/forms";
import { ConfirmedValidator } from "../confirmed.validator";
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
} from "@abacritt/angularx-social-login";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
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

  requiredForm: FormGroup;

  @ViewChild("customGoogleBtn") customGoogleBtn: ElementRef;

  constructor(
    private accountService: AccountopService,
    private fb: FormBuilder,
    private authService: SocialAuthService
  ) {
    this.myForm();
  }

  myForm() {
    this.requiredForm = this.fb.group(
      {
        FirstName: ["", Validators.required],
        LastName: ["", Validators.required],
        EmailAddress: [
          "",
          [
            Validators.required,
            Validators.email,
            Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
          ],
        ],
        Password: ["", [Validators.required, Validators.minLength(6)]],
        NewPassword: ["", [Validators.required]],
      },
      {
        validator: ConfirmedValidator("Password", "NewPassword"),
      }
    );
  }

  ngOnInit() {
    //objAcountModel = new AccountModel();
  }

  onSignUp() {
    //alert("click me");
    //console.log(this.accountModel);
debugger
    if (this.requiredForm.invalid) {
      this.errorString = "Please enter valid inputs.";
      this.showError = true;
    } else {
      this.accountService.signUp(this.accountModel).subscribe((data: any) => {
        if (JSON.parse(data).ID == -1) {
          this.errorString = "Email you provided already exists.";
          this.showError = true;
        } else {
          window.location.href = "/";
        }
      });
    }
  }

  signInWithGoogle(): void {
    debugger
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

  onRedirect() {
    window.location.href = "/forgotpassword";
  }
}
