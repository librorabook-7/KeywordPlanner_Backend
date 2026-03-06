import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { AccountModel } from '../../models/account.model';
import { AccountopService } from '../../services/accountop.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ConfirmedValidator } from '../confirmed.validator';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {
  errorString: string = "";
  showError: boolean = false;  
  accountModel : AccountModel = {
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

  constructor(private accountService: AccountopService, private fb: FormBuilder) { 
    this.myForm();

  }
  
  myForm() {
    this.requiredForm = this.fb.group({
      EmailAddress: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')] ],
    });
  }
  ngOnInit() {
  }

  onSignUp(){
    if(this.requiredForm.invalid){
      this.errorString = "Please enter valid inputs."
      this.showError = true;
    }
    else{
      this.accountService.forgotPassword(this.accountModel).subscribe((data:any) => {
        data = JSON.parse(data);
        if(data.ChangePassword == false){
          this.errorString = "Email you provided does not exist in our database."
          this.showError = true;
        }
        else{
          window.location.href = "/";
        }
        //
      });
    }
  }
  

}
