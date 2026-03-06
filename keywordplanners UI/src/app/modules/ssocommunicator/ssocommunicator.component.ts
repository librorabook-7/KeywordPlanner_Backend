import { Component, OnInit } from '@angular/core';
//import { AuthService, SocialUser, GoogleLoginProvider} from "angularx-social-login";

@Component({
  selector: 'app-ssocommunicator',
  templateUrl: './ssocommunicator.component.html',
  styleUrls: ['./ssocommunicator.component.css']
})
export class SSOCommunicatorComponent implements OnInit {
  //user: SocialUser;
  loggedIn: boolean;

  constructor() { }

  ngOnInit() {
    //console.log("going for signwithgoogle")
    this.signInWithGoogle();

    // this.authService.authState.subscribe((user) => {
    //   this.user = user;
    //   this.loggedIn = (user != null);
    // });

  }

  signInWithGoogle(): void {
    //console.log('Provider Id:' + GoogleLoginProvider.PROVIDER_ID);
    //this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);

    // this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(res => {
    //   //this.router.navigate(['/user']);
    //   console.log(res);
    //   this.user = res;
    // })
  }

  signOut(): void {
    //this.authService.signOut();
  }

}
