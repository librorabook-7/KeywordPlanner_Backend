import { Component, OnInit } from "@angular/core";
import { AccountopService } from "src/app/services/accountop.service";
import PaypalService from "src/app/services/paypal.service";

@Component({
  selector: "app-keyword-pro",
  templateUrl: "./keyword-pro.component.html",
  styleUrls: ["./keyword-pro.component.css"],
})
export class KeywordProComponent implements OnInit {
  public packages: any;
  public selectedPackage: any;
  selectedCurrency: string = "USD";
  showSuccess;

  constructor(
    private accountopService: AccountopService,
    private paypalService: PaypalService
  ) {}

  ngOnInit() {
    this.getPackages();
    this.initiatePayment();
  }

  private getPackages() {
    this.accountopService.getPackages().subscribe((result) => {
      this.packages = result;
    });
  }
  public choosePackage(selectedPackage) {
    this.selectedPackage = selectedPackage;
  }

  initiatePayment() {
    const paymentAmount = 20;
    this.paypalService.initiatePayment(paymentAmount, this.selectedCurrency);
  }
}
