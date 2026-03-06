import { GtrendingService } from "./gtrending.service";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AccountopService {
  isUserSignedIn = false;
  SignInStatus: BehaviorSubject<boolean>;

  //url = environment.authURL;
  apiURL = environment.apiURL;
  //options = new RequestOptions({ headers: headers, withCredentials: true });

  constructor(private http: HttpClient) {
    this.SignInStatus = new BehaviorSubject(this.isUserSignedIn);
  }

  signUp(objSignUp) {
    return this.http.post(`${this.apiURL}/Account/SignUp`, objSignUp, {
      withCredentials: true,
    });
  }

  signUpSocial(objSignUp) {
    return this.http.post(`${this.apiURL}/Account/SignUpSocial`, objSignUp, {
      withCredentials: true,
    });
  }

  signIn(objSignUp) {
    return this.http.post(`${this.apiURL}/Account/Login`, objSignUp, {
      withCredentials: true,
    });
  }

  changePassword(objSignUp) {
    return this.http.post(`${this.apiURL}/Account/ChangePassword`, objSignUp, {
      withCredentials: true,
    });
  }

  forgotPassword(objSignUp) {
    return this.http.post(`${this.apiURL}/Account/ForgotPassword`, objSignUp, {
      withCredentials: true,
    });
  }

  checkUserLoggedIn() {
    return this.http.get(`${this.apiURL}/Account/CheckUser`, {
      withCredentials: true,
    });
  }

  getPackages() {
    return this.http.get(`${this.apiURL}/Account/GetPackages`, {
      withCredentials: true,
    });
  }

  logOff() {
    return this.http.get(`${this.apiURL}/Account/LogOut`, {
      withCredentials: true,
    });
  }

  setSignIn(blnIsUserSignedIn) {
    this.SignInStatus.next(blnIsUserSignedIn);
  }

  getSignIn() {
    return this.SignInStatus;
    //return this.SignInStatus._value;
  }
  contactCustomerSupport(data: any) {
    return this.http.post(`${this.apiURL}/Account/Contact`, data, {
      withCredentials: true,
    });
  }
  //onChangePassword
}
