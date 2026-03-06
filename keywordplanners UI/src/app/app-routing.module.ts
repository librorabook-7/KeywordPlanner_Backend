import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { KeywordsearchComponent } from "./modules/keywordsearch/keywordsearch.component";
import { SSOCommunicatorComponent } from "./modules/ssocommunicator/ssocommunicator.component";
import { MaincontainerComponent } from "./modules/maincontainer/maincontainer.component";
import { SilentrefreshComponent } from "./modules/silentrefresh/silentrefresh.component";
import { BlogComponent } from "./modules/blog/blog.component";
import { SignupComponent } from "./modules/signup/signup.component";
import { LoginComponent } from "./modules/login/login.component";
import { ChangepasswordComponent } from "./modules/changepassword/changepassword.component";
import { ForgotpasswordComponent } from "./modules/forgotpassword/forgotpassword.component";
import { MetaTagsComponent } from "./modules/meta-tags/meta-tags.component";

const routes: Routes = [
  {
    path: "KeywordSearch",
    component: KeywordsearchComponent,
  },
  {
    path: "SSO",
    component: SSOCommunicatorComponent,
  },
  {
    path: "index.html",
    component: MaincontainerComponent,
  },
  {
    path: "silentrefresh",
    component: SilentrefreshComponent,
  },
  {
    path: "blog",
    component: BlogComponent,
  },
  {
    path: "signup",
    component: SignupComponent,
  },
  {
    path: "login",
    component: LoginComponent,
  },
  {
    path: "changepassword",
    component: ChangepasswordComponent,
  },
  {
    path: "forgotpassword",
    component: ForgotpasswordComponent,
  },
  {
    path: "",
    component: MaincontainerComponent,
  },
  {
    path: "viewtags",
    component: MetaTagsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
