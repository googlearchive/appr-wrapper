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
"appr-wrapper" wraps Apple Pay JS and allows you to write Payment Request API
code to use the API.

Try [a demo](https://web-payment-apis.appspot.com/) from Safari on iOS and
Chrome for Android. See that it works on both platforms in a single code base.

## Build the code
The repo comes with a build script (`./dist/appr.js`) but in case you want to
build one yourself, follow this instruction:

Clone the repo

```
git clone git@github.com:GoogleChrome/appr-wrapper.git
```

Pull dependencies

```
npm install
```

Build the code

```
npm run build
```

## Try the demo on your own server
To try the demo on your own server, you need to go through Apple Pay JS merchant
registration process. [Follow Apple's instructions and setup
yours](https://developer.apple.com/reference/applepayjs). There are 3 things
required:

* Verify your domain by putting a file you can obtain from Apple named
  `apple-developer-merchantid-domain-association` in `./demo/well-known` folder.
* Put your merchant identity certificate to `./certs` directory with a name
  `apple-pay-cert.pem` at project's root.
* Modify `./demo.js` and replace params with your own configuration:
  `APPLE_PAY_CERTIFICATE_PATH`, `MERCHANT_IDENTIFIER`, `MERCHANT_DOMAIN`,
  `MERCHANT_DISPLAY_NAME`

One the set up is done, run the server:

```
npm run serve
```

## How to use
`./dist/appr.js` will be the code to import. You can either load it from
`script` tag or `import` it via module loader.

```html
<script src="./scripts/appr.js"></script>
```
 
```js
import PaymentRequest from './appr.js';
```

Then, simply implement [Payment Request
API](https://developers.google.com/web/fundamentals/discovery-and-monetization/payment-request/)
following [the standard](https://www.w3.org/TR/payment-request/). You can handle
[Apple Pay JS](https://developer.apple.com/reference/applepayjs) by adding a
payment method specifying "`https://apple.com/apple-pay`" as following example:

```js
let method = [{
  supportedMethods: ['https://apple.com/apple-pay'],
  data: {
    supportedNetworks: [
      'amex', 'discover', 'masterCard', 'visa'
    ],
    countryCode: 'US',
    validationEndpoint: '/applepay/validate/',
    merchantIdentifier: 'merchant.com.agektmr.payment'
  }
}];

let details = {
  displayItems: [{
    label: 'Original donation amount',
    amount: { currency: 'USD', value: '0.01' }
  }],
  shippingOptions: [{
    id: 'standard',
    label: 'Standard shipping',
    amount: { currency: 'USD', value: '0.01' }
  }, {
    id: 'express',
    label: 'Express shipping',
    amount: { currency: 'USD', value: '0.99' }
  }],
  total: {
    label: 'Total due',
    amount: { currency: 'USD', value : '0.01' }
  }
};

let options = {
  requestShipping: true,
  requestPayerEmail: true,
  requestPayerPhone: true,
  requestPayerName: true,
  shippingType: 'shipping'
};

let request = new PaymentRequest(methods, details, options);
let response;

request.addEventListener('shippingaddresschange', e => {
  e.updateWith(new Promise(resolve => {
    let result;
    let addr = request.shippingAddress;
    let price = new priceCalc(details);
    if (addr.country.toUpperCase() === 'US') {
      result = price.selectShippingOption('standard');
    } else if (addr.country.toUpperCase() === 'JP') {
      result = price.selectShippingOption('express');
    } else {
      details.shippingOptions = [];
      resolve(details);
      return;
    }
    resolve(result);
  }));
});

request.addEventListener('shippingoptionchange', e => {
  e.updateWith(new Promise(resolve => {
    let calc = new priceCalc(details);
    let result = calc.selectShippingOption(request.shippingOption);
    resolve(result);
  }));
});

request.show().then(result => {
  if (response.methodName === 'https://apple.com/apple-pay') {
    // Apple Pay JS case
    // Do whatever you need to do with the token:
    // `response.applePayRaw`
  } else {
    // Everything else will be pure Payment Request API response
  }
}).then(response => {
  response.complete('success');
}).catch(e => {
  if (e) {
    alert(`Could not make payment: ${e}`);
  }
  if (response) {
    response.complete('fail');
  }
});
```

### Payment method properties
The first argument to the `PaymentRequest` constructor.

* [`supportedNetworks`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916122-supportednetworks) is required.
* `data`:
    * [`countryCode`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916117-countrycode) is required.
    * [`billingContact`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916125-billingcontact) is optional.
    * [`shippingContact`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916127-shippingcontact) is optional. It allows you to provide default shipping contact information in Apple Pay JS.
    * [`merchantCapabilities`](https://developer.apple.com/reference/applepayjs/paymentrequest/1916123-merchantcapabilities) defaults to ['supports3DS'] unless you provide any.
    * `validationEndpoint` is optional. Specify the merchant validation endpoint on your server. If you omit this, handle validatemerchant event yourself.
    * `merchantIdentifier` is required. Specify your merchant id.

With `validationEndpoint`, appr-wrapper automatically handles `validatemerchant`
event for you. On your server's specified endpoint, you'll receive a `POST`
request with `validationURL`, so you can validate yourself and respond with a
merchant session object returned following [these
instructions](https://developer.apple.com/reference/applepayjs/applepaysession/1778021-onvalidatemerchant).
You can optionally handle the `validatemerchant` event by yourself by adding an
event handler.

```js
let method = [{
  supportedMethods: ['https://apple.com/apple-pay'],
  data: {
    supportedNetworks: [
      'amex', 'discover', 'masterCard', 'visa'
    ],
    countryCode: 'US',
    validationEndpoint: '/applepay/validate/',
    merchantIdentifier: 'merchant.com.agektmr.payment'
  }
}];
```

### Payment details properties
The second argument to the `PaymentRequest` constructor.

* The `total.amount.currency` is converted to
  [currencyCode](https://developer.apple.com/reference/applepayjs/paymentrequest/1916118-currencycode)
  in Apple Pay JS.

```js
let details = {
  displayItems: [{
    label: 'Original donation amount',
    amount: { currency: 'USD', value: '0.01' }
  }],
  shippingOptions: [{
    id: 'standard',
    label: 'Standard shipping',
    amount: { currency: 'USD', value: '0.01' }
  }, {
    id: 'express',
    label: 'Express shipping',
    amount: { currency: 'USD', value: '0.99' }
  }],
  total: {
    label: 'Total due',
    amount: { currency: 'USD', value : '0.01' }
  }
};
```

Let's look into what each parameters convert to, one by one.

### Payment options properties
The third argument to the `PaymentRequest` constructor.
* `requestPayerEmail`, `requestPayerPhone`, `requestPayerName` are respectively
  converted to
  [`requireBillingContactFields`](https://developer.apple.com/reference/applepayjs/paymentrequest/2216120-requiredbillingcontactfields)
  and
  [`requireShippingContactFields`](https://developer.apple.com/reference/applepayjs/paymentrequest/2216121-requiredshippingcontactfields)
  values in Apple Pay JS.
* `pickup` in `shippingType` will be converted to `servicePickup` in Apple Pay
  JS. Others are handled as they are.

```js
let options = {
  requestShipping: true,
  requestPayerEmail: true,
  requestPayerPhone: true,
  requestPayerName: true,
  shippingType: 'shipping'
};
```

### canMakePayment()
`canMakePayment()` will invoke `canMakePaymentsWithActiveCard()` in Apple Pay JS.

```js
request.canMakePayment().then(result => {
  if (result) {
    return request.show();
  } else {
    // fallback to checkout form or start setting up ApplePayJS
  }
});
```

### Shipping contact selected event / shipping method selected event
You can handle
* [`shippingcontactselected`](https://developer.apple.com/reference/applepayjs/applepayshippingcontactselectedevent)
  event in Apple Pay JS as `shippingaddresschange` event in Payment Request.
* [`shippingmethodselected`](https://developer.apple.com/reference/applepayjs/applepayshippingmethodselectedevent)
  event in Apple Pay JS as `shippingoptionchange` event in Payment Request.

```js
request.addEventListener('shippingaddresschange', e => {
  e.updateWith(new Promise(resolve => {
    let result;
    let addr = request.shippingAddress;
    let price = new priceCalc(details);
    if (addr.country.toUpperCase() === 'US') {
      result = price.selectShippingOption('standard');
    } else if (addr.country.toUpperCase() === 'JP') {
      result = price.selectShippingOption('express');
    } else {
      details.shippingOptions = [];
      resolve(details);
      return;
    }
    resolve(result);
  }));
});

request.addEventListener('shippingoptionchange', e => {
  e.updateWith(new Promise(resolve => {
    let calc = new priceCalc(details);
    let result = calc.selectShippingOption(request.shippingOption);
    resolve(result);
  }));
});
```

### Handling payment response
Once `show()` resolves, you will recive an object which is slightly different
from actual `PaymentResponse` object. Equivalent to this resolution is
[`paymentauthorized`](https://developer.apple.com/reference/applepayjs/applepaypaymentauthorizedevent)
event where you will receive an event object that contains an
[`ApplePayPayment`](https://developer.apple.com/reference/applepayjs/applepaypayment)
object in Apple Pay JS.

To determine if the response is for Apple Pay JS, you can examine `methodName`
property of the payment response. If it is "`https://apple.com/apple-pay`", this
is Apple Pay JS. The payment response object is constructed to replicate
`PaymentResponse` as much as possible, but it's not perfect due to technical
restrictions. If you prefer using actual payment response from Apple Pay JS API,
try `applePayRaw` property which holds actual `ApplePayPayment` object.

```js
request.show().then(result => {
  // process payment
  response = result;
  if (response.methodName === 'https://apple.com/apple-pay') {
    // Apple Pay JS case
    // Do whatever you need to do with the token:
    // `response.applePayRaw`
  } else {
    // Everything else will be pure Payment Request API response
  }
}).then(response => {
  response.complete('success');
}).catch(e => {
  if (e) {
    alert(`Could not make payment: ${e}`);
  }
  if (response) {
    response.complete('fail');
  }
});
```
