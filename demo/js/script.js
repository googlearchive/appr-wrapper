//    Copyright 2017 Google
//
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
//
//        http://www.apache.org/licenses/LICENSE-2.0
//
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

const merchantId = 'merchant.com.agektmr.payment';

class priceCalc {
  constructor(details) {
    this.details = details;
  }

  selectShippingOption(id) {
    let newShippingOption = null;
    let oldShippingOption = null;

    // Pick new shipping option and clear selection
    for (let index in this.details.shippingOptions) {
      let option = this.details.shippingOptions[index];
      if (option.id === id) {
        if (!option.selected) {
          this.details.shippingOptions[index].selected = true;
          newShippingOption = option;
        }
      } else {
        if (option.selected) {
          oldShippingOption = option;
        }
        this.details.shippingOptions[index].selected = false;
      }
    }

    // If `newShippingOption` is not assigned, no changes.
    if (!newShippingOption) {
      return this.details;
    }

    let price = 0;
    for (let index = 0; index < this.details.displayItems.length; index++) {
      let item = this.details.displayItems[index];
      if (oldShippingOption && item.label === oldShippingOption.label) {
        this.details.displayItems.splice(index--, 1);
      } else {
        price += parseFloat(item.amount.value);
      }
    }
    this.details.displayItems.push(newShippingOption);
    price += parseFloat(newShippingOption.amount.value);

    this.details.total.amount.value = price.toString();
    return this.details;
  }
}

const methods = [{
  supportedMethods: 'https://apple.com/apple-pay',
  data: {
    supportedNetworks: [
      'amex', 'discover', 'masterCard', 'visa'
    ],
    version: 3,
    countryCode: 'US',
    merchantIdentifier: merchantId,
    merchantCapabilities: ['supports3DS']
  }
}, {
  supportedMethods: 'https://bobpay.xyz/pay'
}];

function onBuyClicked(event) {
  if (!PaymentRequest) {
    alert('PaymentRequest is not available!');
    return;
  }
  // Payment Request API is available.
  // Stop the default anchor redirect.
  event.preventDefault();

  const details = {
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

  const options = {
    requestShipping: true,
    requestPayerEmail: true,
    requestPayerPhone: true,
    requestPayerName: true,
    shippingType: 'shipping'
  };

  // Initialization
  const request = new PaymentRequest(methods, details, options);

  // When user selects a shipping address
  request.addEventListener('shippingaddresschange', e => {
    e.updateWith(new Promise(resolve => {
      let result;
      const addr = request.shippingAddress;
      const price = new priceCalc(details);
      // Shipping to US is supported
      if (addr.country.toUpperCase() === 'US') {
        result = price.selectShippingOption('standard');
      // Shipping to JP is supported
      } else if (addr.country.toUpperCase() === 'JP') {
        result = price.selectShippingOption('express');
      // Shipping to elsewhere is unsupported
      } else {
        // Empty array indicates rejection of the address
        details.shippingOptions = [];
        resolve(details);
        return;
      }
      resolve(result);
    }));
  });

  // When user selects a shipping option
  request.addEventListener('shippingoptionchange', e => {
    e.updateWith(new Promise(resolve => {
      const calc = new priceCalc(details);
      const result = calc.selectShippingOption(request.shippingOption);
      // There should be only one option. Do nothing.
      resolve(result);
    }));
  });

  // When merchant validation is required
  request.addEventListener('merchantvalidation', e => {
    const headers = new Headers({
      'Content-Type': 'application/json'
    });
    const promise = fetch('/applepay/validate/', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({validationURL: e.validationURL})
    }).then(res => {
      if (res.status === 200) {
        return res.json();
      }
    });
    e.complete(promise);
  });

  let response;

  if (event.target.classList.contains('apple-pay-set-up-button')) {
    ApplePaySession.openPaymentSetup(merchantId).then(() => {
      event.target.classList.remove('apple-pay-set-up-button');
    });
    return;
  }

  request.show().then(result => {
    response = result;
    switch (response.methodName) {
      case 'https://apple.com/apple-pay':
        console.log('This is Apple Pay');
        console.log(response);
        break;
      case 'https://bobpay.xyz/pay':
        console.log('This is Bobpay');
        console.log(response);
        break;
      default:
        console.log('This is ' + response.methodName);
        console.log(response);
        break;
    }
    // Emulate an interaction with a server
    setTimeout(() => {
      response.complete('success');
      alert('payment successfully complete!');
    }, 2000);
  }).catch(function(err) {
    if (err) {
      alert(`Could not make payment: ${err}`);
    }
    if (response) {
      response.complete('fail');
    }
  });
}

// Assuming an anchor is the target for the event listener.
window.addEventListener('DOMContentLoaded', function() {
  const button = document.querySelector('#payment');
  if (window.PaymentRequest) {
    const details = {
      total: {label:'Total',amount:{currency:'USD',value:'10'}}
    };
    const request = new PaymentRequest(methods, details);
    request.canMakePayment().then(result => {
      if (result) {
        if (window.ApplePaySession) {
          button.classList.add('apple-pay-button');
        } else {
          button.classList.add('payment-request-button');
        }
        button.addEventListener('click', onBuyClicked);
      } else if (window.ApplePaySession) {
        button.classList.add('apple-pay-set-up-button');
      }
    });
  }
  fetch('/js/script.js').then(code => {
    return code.text();
  }).then(text => {
    document.querySelector('#code').innerText = text;
  });
});
