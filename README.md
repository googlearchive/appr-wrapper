<!---
    Copyright 2017 Google

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
-->

# appr-wrapper: Payment Request wrapper for Apple Pay JS
This library allows you to write Payment Request API code to support Apple Pay JS.

[See how it works at a demo here](https://web-payment-apis.appspot.com/).
## Usage
Pull dependencies
    npm install

Build the code
    gulp webpack

To test with your own server, you need to go through merchant registration process Apple Pay JS requires. Follow the instruction and setup yours.

## How to use
Simply implement [Payment Request API](https://developers.google.com/web/fundamentals/discovery-and-monetization/payment-request/) following [the standard](https://www.w3.org/TR/payment-request/). You can handle [Apple Pay JS](https://developer.apple.com/reference/applepayjs) by adding a payment method specifying "[`https://apple.com/apple-pay`](https://apple.com/apple-pay)" as following example:

```
{
  supportedMethods: ['https://apple.com/apple-pay'],
  data: {
    supportedNetworks: [
      'amex', 'discover', 'masterCard', 'visa'
    ],
    countryCode: 'US',
    validationEndpoint: '/applepay/validate/',
    merchantIdentifier: 'merchant.com.agektmr.payment'
  }
}
```

### Payment method properties

* [`supportedNetworks`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916122-supportednetworks) is required.
* [`countryCode`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916117-countrycode) is required.
* [`billingContact`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916125-billingcontact) is optional.
* [`shippingContact`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916127-shippingcontact) is optional. It allows you to provide default shipping contact information in Apple Pay JS.
* [`merchantCapabilities`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916123-merchantcapabilities) defaults to `['supports3DS']` unless you provide any.

Other arguments to [`PaymentRequest`](https://www.w3.org/TR/payment-request/#paymentrequest-interface) constructor may provide different meanings to Apple Pay JS.

* `validationEndpoint` specifies merchant validation endpoint.
* `merchantIdentifier` specifies merchant id.


### Payment details properties

* [`currencyCode`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916118-currencycode) will be picked from the first displayItem's amount.currency.


### Payment options properties

* `requestPayerEmail`, `requestPayerPhone`, `requestPayerName` are respectively converted to [`requireBillingContactFields`](https://developer.apple.com/reference/applepayjs/paymentrequest/2216120-requiredbillingcontactfields) and [`requireShippingContactFields`](https://developer.apple.com/reference/applepayjs/paymentrequest/2216121-requiredshippingcontactfields) values.
* `pickup` in `shippingType` will be converted to `servicePickup` in Apple Pay JS. Others are handled as they are.


### canMakePayment()
`canMakePayment()` will invoke `canMakePaymentsWithActiveCard()` in Apple Pay JS.

### Merchant validation
With `validationEndpoint`, appr-wrapper automatically handles `validatemerchant` event for you. On your server's specified endpoint, you'll receive a `POST` request with `validationURL`, so you can validate yourself and respond with a merchant session object returned following [these instructions](https://developer.apple.com/reference/applepayjs/applepaysession/1778021-onvalidatemerchant).
You can optionally handle the `validatemerchant` event yourself by adding an event handler.

### Shipping contact selected event / shipping method selected event
You can handle `shippingcontactselected` event in Apple Pay JS as `shippingaddresschange` event in Payment Request, `shippingmethodselected` event in Apple Pay JS as `shippingoptionchange` event in Payment Request respectively.
