import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule, HttpClientJsonpModule } from "@angular/common/http";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { KeywordsearchComponent } from "./modules/keywordsearch/keywordsearch.component";
import { KeywordserviceService } from "./services/keywordservice.service";
import { TableRowsComponent } from "./modules/table-rows/table-rows.component";
import { AppLoaderComponent } from "./modules/app-loader/app-loader.component";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { LoaderService } from "./services/loader.service";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { LoaderInterceptor } from "./interceptors/loader.interceptor";
import { NgxPaginationModule } from "ngx-pagination";
import { AddCampaignComponent } from "./modules/add-campaign/add-campaign.component";
import { MatDialogModule } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SSOCommunicatorComponent } from "./modules/ssocommunicator/ssocommunicator.component";
import { PadzeroPipe } from "./Pipes/padzero.pipe";
import { SafeHtmlPipe } from "./Pipes/safe-html.pipe";
import { MaterialModule } from "./material/material.module";
//import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
// import {
//   GoogleLoginProvider,
//   FacebookLoginProvider
// } from 'angularx-social-login';

import { SummaryInfoComponent } from "./modules/summary-info/summary-info.component";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaincontainerComponent } from "./modules/maincontainer/maincontainer.component";
import { BlogComponent } from "./modules/blog/blog.component";
import { GoogletrendsComponent } from "./modules/googletrends/googletrends.component";
import { SilentrefreshComponent } from "./modules/silentrefresh/silentrefresh.component";
import { MDBBootstrapModule } from "angular-bootstrap-md";
import { ArrayuniquePipe } from "./Pipes/arrayunique.pipe";
import { CompkeywordsearchComponent } from "./modules/compkeywordsearch/compkeywordsearch.component";
import { SearchvolumekeywordsearchComponent } from "./modules/searchvolumekeywordsearch/searchvolumekeywordsearch.component";
import { YtubeComponent } from "./modules/ytube/ytube.component";
import { SignupComponent } from "./modules/signup/signup.component";
import { LoginComponent } from "./modules/login/login.component";
import { ChangepasswordComponent } from "./modules/changepassword/changepassword.component";
import { ForgotpasswordComponent } from "./modules/forgotpassword/forgotpassword.component";
import { KeywordProComponent } from "./modules/keyword-pro/keyword-pro.component";
import { CustomerSupportComponent } from "./modules/customer-support/customer-support.component";

import {
  GoogleLoginProvider,
  FacebookLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from "@abacritt/angularx-social-login";

import { GoogleSigninButtonDirective } from "@abacritt/angularx-social-login";
import { MetaTagsComponent } from "./modules/meta-tags/meta-tags.component";
// let config = new AuthServiceConfig([
//   {
//     id: GoogleLoginProvider.PROVIDER_ID,
//     lazyLoad:false,
//     provider: new GoogleLoginProvider(
//       '420449244931-lkq7o3avieeigv7lenghfu9b7lebcrul.apps.googleusercontent.com'
//     )
//   },
//   {
//     id: FacebookLoginProvider.PROVIDER_ID,
//     provider: new FacebookLoginProvider('235397345848911')
//   }
//   //235397345848911
//  ]);

//  export function provideConfig() {
//   return config;
// }

// const googleLoginOptions: LoginOpt = {
//   scope: 'profile email'
// };

// let config = new AuthServiceConfig([
//   {
//     // id: GoogleLoginProvider.PROVIDER_ID,
//     id: GoogleLoginProvider.PROVIDER_ID,
//     provider: new GoogleLoginProvider("364567748615-3drckutorlosa8l6q10mscv51ammto3s.apps.googleusercontent.com")
//   },

// ]);

// export function provideConfig() {
//   return config;
// }

@NgModule({
  declarations: [
    AppComponent,
    KeywordsearchComponent,
    TableRowsComponent,
    AppLoaderComponent,
    AddCampaignComponent,
    SSOCommunicatorComponent,
    PadzeroPipe,
    SafeHtmlPipe,
    SummaryInfoComponent,
    MaincontainerComponent,
    GoogletrendsComponent,
    SilentrefreshComponent,
    ArrayuniquePipe,
    CompkeywordsearchComponent,
    SearchvolumekeywordsearchComponent,
    YtubeComponent,
    BlogComponent,
    SignupComponent,
    LoginComponent,
    ChangepasswordComponent,
    ForgotpasswordComponent,
    KeywordProComponent,
    CustomerSupportComponent,
    MetaTagsComponent,
  ],
  entryComponents: [AddCampaignComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MatProgressSpinnerModule,
    NgxPaginationModule,
    MatDialogModule,
    BrowserAnimationsModule,
    //SocialLoginModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MDBBootstrapModule.forRoot(),
    SocialLoginModule,
    //SocialLoginModule
  ],
  providers: [
    KeywordserviceService,
    LoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    {
      provide: "SocialAuthServiceConfig",
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              "170248800935-75gqbe6cqul3369fn7shcalvmi1hja4i.apps.googleusercontent.com"
            ),
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider("617158460633025"),
          },
        ],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig,
    },
    GoogleSigninButtonDirective,
    // {
    //   provide: AuthServiceConfig,
    //   useFactory: provideConfig
    // }
    // {
    //   provide: AuthServiceConfig,
    //   useFactory: provideConfig
    // }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
