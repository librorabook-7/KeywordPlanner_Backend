import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AccountopService } from "src/app/services/accountop.service";

@Component({
  selector: "app-customer-support",
  templateUrl: "./customer-support.component.html",
  styleUrls: ["./customer-support.component.css"],
})
export class CustomerSupportComponent implements OnInit {
  contactForm: FormGroup;
  isSubmit: boolean = false;
  successMessage = "";

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountopService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.contactForm = this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      subject: ["", Validators.required],
      message: ["", Validators.required],
    });
  }

  onSubmit() {
    this.isSubmit = true;
    if (this.contactForm.valid) {
      document.getElementById("waisaydiv").style.display = "";
      this.accountService
        .contactCustomerSupport(this.contactForm.value)
        .subscribe((res) => {
          document.getElementById("waisaydiv").style.display = "none";
          this.initForm();
          this.isSubmit = false;
          this.successMessage =
            "Thank you for your message! We will get back to you shortly.";
          setTimeout(() => {
            this.successMessage = "";
          }, 10000);
        });
    }
  }
}
