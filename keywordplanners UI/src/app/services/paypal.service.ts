import { Injectable } from "@angular/core";
declare var paypal: any;
import { Router } from "@angular/router";
import { SuccessErrorConst } from "./successErrorConst";

@Injectable({
  providedIn: "root",
})
export class PaypalService {
  constructor(private router: Router) {}

  initiatePayment(amount: number, currency: string) {
    paypal
      .Buttons({
        createOrder: function (
          data: any,
          actions: {
            order: {
              create: (arg0: {
                purchase_units: {
                  amount: { currency_code: string; value: string };
                }[];
              }) => any;
            };
          }
        ) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: currency,
                  value: amount.toString(),
                },
              },
            ],
          });
        },
        onApprove: function (
          data: any,
          actions: { order: { capture: () => Promise<any> } }
        ) {
          return actions.order.capture().then((details: any) => {
            console.log("Payment successful:", details);
            localStorage.setItem("Payment_successful", JSON.stringify(details));
            alert(SuccessErrorConst.Payment);
            this.router.navigate(["payment/invoice"]);
          });
        },
        onError: (error: any) => {
          console.error("Payment error:", error);
          if (error.status === 400) {
            alert(SuccessErrorConst.errorMessage400);
          } else if (error.status === 401) {
            alert(SuccessErrorConst.errorMessage401);
          } else if (error.status === 422) {
            alert(SuccessErrorConst.errorMessage422);
          } else if (error.status === 403) {
            alert(SuccessErrorConst.errorMessage403);
          }
        },
      })
      .render("#paypal-button-container");
  }
}
export default PaypalService;
