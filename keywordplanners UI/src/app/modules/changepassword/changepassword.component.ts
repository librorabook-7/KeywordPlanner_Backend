import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { AccountModel } from '../../models/account.model';
import { AccountopService } from '../../services/accountop.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ConfirmedValidator } from '../confirmed.validator';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})
export class ChangepasswordComponent implements OnInit {
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
      Password: ['', [Validators.required, Validators.minLength(6)] ],
      NewPassword: ['', [Validators.required, Validators.minLength(6)] ],
      ConfirmPassword: ['', [Validators.required]]
    },{ 
      validator: ConfirmedValidator('NewPassword', 'ConfirmPassword')
    });
 }

  ngOnInit() {
  }

  onChangePassword(){
    //alert("click me");
    //console.log(this.accountModel);

    if(this.requiredForm.invalid){
      this.errorString = "Please enter valid inputs."
      this.showError = true;
    }
    else{
      this.accountService.changePassword(this.accountModel).subscribe((data:any) => {
        data = JSON.parse(data)
        if(data.ChangePassword){
          window.location.href = "/"
        }
        else{
          this.errorString = "Either username or password is incorrect."
          this.showError = true;
        }
        
      });
    }

    

  }

  onRedirect(){
    window.location.href = "/forgotpassword";
  }
}
