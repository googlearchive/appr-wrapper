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

const assert = chai.assert;
const expect = chai.expect;

// TODO: Test either ApplePayJS or PaymentRequest at a time.
if (!window.ApplePaySession) {
  // Dummy object
  window.ApplePaySession = class {
    constructor(version, pr) {
      return;
    }
    addEventListener(target, handler) {
      return;
    }
    static get STATUS_SUCCESS() {return 'SUCCESS'}
    static get STATUS_FAILURE() {return 'FAILURE'}
  };
}
if (!window.PaymentRequest) {
  // Dummy object
  window.PaymentRequest = {};
}

const APSupportedNetworks = [
  'amex',
  'discover',
  'jcb',
  'masterCard',
  'privateLabel',
  'visa'
];
const PRSupportedNetworks = [
  'amex',
  'diners',
  'discover',
  'jcb',
  'mastercard',
  'mir',
  'unionpay',
  'visa'
];

let supportedNetworks;
let methodData;
let details;
let options;

before(function() {
  supportedNetworks = [
    'amex',
    'discover',
    'jcb',
    'masterCard',
    'privateLabel',
    'amex',
    'diners',
    'mastercard',
    'mir',
    'unionpay',
    'visa'
  ];
  methodData= [{
    supportedMethods: supportedNetworks
  }];
  details = {
    countryCode: 'US',
    displayItems: [{
      label: 'Original donation amount',
      amount: { currency: 'USD', value: '65.00' },
      pending: true
    }, {
      label: 'Friends and family discount',
      amount: { currency: 'USD', value: '-10.00' }
    }],
    shippingOptions: [{
      id: 'standard',
      label: 'Standard shipping',
      amount: { currency: 'USD', value: '0.0' }
    }, {
      id: 'express',
      label: 'Express shipping',
      amount: { currency: 'USD', value: '10.0' }
    }],
    total: {
      label: 'total',
      amount: {
        currency: 'USD',
        value: '55.00'
      }
    }
  };
  options = {
    requestShipping: true,
    requestPayerName: true,
    requestPayerPhone: true,
    requestPayerEmail: true,
    shippingType: 'shipping'
  };
});

describe('PaymentRequestConverter', function() {
  describe('methodData', function() {
    let prc;
    before(function() {
      const testMethodData= [{
        supportedMethods: ['basic-card'],
        data: {
          supportedNetworks: supportedNetworks,
          supportedTypes: ['credit']
        }
      }];
      prc = new PaymentRequestConverter(testMethodData, details, options);
    });
    it('should be properly filtered picking items from `supportedNetworks` for ApplePayJS', function(done) {
      assert.sameMembers(prc.APPaymentRequest.supportedNetworks, APSupportedNetworks);
      done();
    });
    it('should be properly located filtered for PaymentRequest', function(done) {
      assert.sameMembers(prc.PRPaymentRequest.methodData[0].data.supportedNetworks, PRSupportedNetworks);
      done();
    });
  });

  describe('methodData', function() {
    let prc;
    before(function() {
      const testMethodData = [{
        supportedMethods: supportedNetworks
      }];
      prc = new PaymentRequestConverter(testMethodData, details, options);
    });
    it('should be properly filtered picking items from `supportedMethods` for ApplePayJS', function(done) {
      assert.sameMembers(prc.APPaymentRequest.supportedNetworks, APSupportedNetworks);
      done();
    });
    it('should be properly located for PaymentRequest', function(done) {
      assert.sameMembers(prc.PRPaymentRequest.methodData[0].supportedMethods, PRSupportedNetworks);
      done();
    });
  });

  describe('details', function() {
    let prc;
    before(function() {
      prc = new PaymentRequestConverter(methodData, details, options);
    });
    it('should contain proper `countryCode` in ApplePayJS', function() {
      assert.equal(prc.APPaymentRequest.countryCode, 'US');
    });
    it('should contain same `lineItems` in ApplePayJS', function(done) {
      assert.deepEqual(prc.APPaymentRequest.lineItems, [{
        label: 'Original donation amount',
        amount: '65.00',
        type: 'pending'
      }, {
        label: 'Friends and family discount',
        amount: '-10.00',
        type: 'final'
      }]);
      done();
    });
    it('should contain same `displayItems` in PaymentRequest', function(done) {
      assert.deepEqual(prc.PRPaymentRequest.details.displayItems, [{
        label: 'Original donation amount',
        amount: {currency: 'USD', value: '65.00'},
        pending: true
      }, {
        label: 'Friends and family discount',
        amount: {currency: 'USD', value: '-10.00'}
      }]);
      done();
    });
    it('should contain same `total` in ApplePayJS', function(done) {
      assert.deepEqual(prc.APPaymentRequest.total, {
        label: 'total',
        amount: '55.00',
        type: 'final'
      });
      done();
    });
    it('should contain same `total` in PaymentRequest', function(done) {
      assert.deepEqual(prc.PRPaymentRequest.details.total, {
        label: 'total',
        amount: {
          currency: 'USD',
          value: '55.00'
        }
      });
      done();
    });
    it('should provide "supports3DS" in `merchantCapabilities` for ApplePayJS', function() {
      assert.sameMembers(prc.APPaymentRequest.merchantCapabilities, ['supports3DS']);
    });
  });

  describe('options', function() {
    let prc;
    before(function() {
      prc = new PaymentRequestConverter(methodData, details, options);
    });
    it('should include "postalAddress", "name" in `requiredBillingContactFields` for ApplePayJS', function(done) {
      assert.sameMembers(prc.APPaymentRequest.requiredBillingContactFields, [
        'postalAddress', 'name' ]);
      done();
    });
    it('should include "postalAddress", "name", "email" and "phone" in `requireShippingContactFields` for ApplePayJS', function(done) {
      assert.sameMembers(prc.APPaymentRequest.requiredShippingContactFields, [
        'postalAddress', 'name', 'email', 'phone' ]);
      done();
    });
  });
  describe('options.shippingType === "shipping"', function() {
    it('should include `shippingType` of "shipping"', function() {
      options.shippingType = 'shipping';
      let prc = new PaymentRequestConverter(methodData, details, options);
      assert.equal(prc.APPaymentRequest.shippingType, 'shipping');
    });
  });
  describe('options.shippingType === "delivery"', function() {
    it('should include `shippingType` of "delivery"', function() {
      options.shippingType = 'delivery';
      let prc = new PaymentRequestConverter(methodData, details, options);
      assert.equal(prc.APPaymentRequest.shippingType, 'delivery');
    });
  });
  describe('options.shippingType === "pickup"', function() {
    let prc;
    before(function() {
      options.shippingType = 'pickup';
      prc = new PaymentRequestConverter(methodData, details, options);
    });
    it('should include `shippingType` of "storePickup" for ApplePayJS', function() {
      assert.equal(prc.APPaymentRequest.shippingType, 'storePickup');
    });
    it('should include `shippingType` of "pickup" for PaymentRequest', function() {
      assert.equal(prc.PRPaymentRequest.options.shippingType, 'pickup');
    });
  });
  describe('options.shippingType === "storePickup"', function() {
    let prc;
    before(function() {
      options.shippingType = 'storePickup';
      prc = new PaymentRequestConverter(methodData, details, options);
    });
    it('should include `shippingType` of "storePickup" for ApplePayJS', function() {
      assert.equal(prc.APPaymentRequest.shippingType, 'storePickup');
    });
    it('should include `shippingType` of "pickup" for PaymentRequest', function() {
      assert.equal(prc.PRPaymentRequest.options.shippingType, 'pickup');
    });
  });
  describe('options.shippingType === "servicePickup"', function() {
    let prc;
    before(function() {
      options.shippingType = 'servicePickup';
      prc = new PaymentRequestConverter(methodData, details, options);
    });
    it('should include `shippingType` of "servicePickup"', function() {
      assert.equal(prc.APPaymentRequest.shippingType, 'servicePickup');
    });
    it('should include `shippingType` of "pickup" for PaymentRequest', function() {
      assert.equal(prc.PRPaymentRequest.options.shippingType, 'pickup');
    });
  });
});

describe('PaymentRequestAP', function() {
  describe('instantiation', function() {
    it('instantiates', function() {
      let prap = new PaymentRequestAP(methodData, details, options);
    });
  });
  describe('Events', function() {
    let prap;
    let dummy;
    let eventHandler;
    let assertResult;
    let shippingAddressChange;
    // TODO: Test that `addEventListener` and `on~` have the same effect.
    before(function() {
      dummy = details;
      eventHandler = e => {
        e.updateWith(new Promise(resolve => {
          resolve(dummy);
        }));
      };
      assertResult = (done, target) => {
        return (...result) => {
          console.log(result);
          if (result !== 'event test') {
            throw `Error in ${target}`;
          }
          console.log(`${target} done.`);
          done();
        };
      };
      shippingAddressChange = () => {
        return new Promise(resolve => {
          let addr = prap.shippingAddress;
          let shippingOption = {
            id: '',
            label: '',
            amount: { currency: 'USD', value: '0.00' },
            selected: true
          };
          // Shipping to US is supported
          if (addr.country === 'US') {
            for (let index in details.shippingOptions) {
              let option = details.shippingOptions[index];
              if (option.id === 'standard') {
                details.shippingOptions[index].selected = true;
                shippingOption.id = option.id;
                shippingOption.label = option.label;
                shippingOption.amount.value = option.amount.value;
              } else {
                details.shippingOptions[index].selected = false;
              }
            }
          // Shipping to JP is supported
          } else if (addr.country === 'JP') {
            for (let index in details.shippingOptions) {
              let option = details.shippingOptions[index];
              if (option.id === 'express') {
                details.shippingOptions[index].selected = true;
                shippingOption.id = option.id;
                shippingOption.label = option.label;
                shippingOption.amount.value = option.amount.value;
              } else {
                details.shippingOptions[index].selected = false;
              }
            }
          // Shipping to elsewhere is unsupported
          } else {
            // Empty array indicates rejection of the address
            details.shippingOptions = [];
            resolve(details);
            return;
          }
          // Hardcode for simplicity
          let done = false;
          for (let index in details.displayItems) {
            let item = details.displayItems[index];
            if (item.id === 'express' || item.id === 'standard') {
              details.displayItems[index] = shippingOption;
              // Subtract the shipping fee
              // TODO: Sum
              // details.total.amount.velue -= item.amount.value;
              done = true;
              break;
            }
          }
          if (!done) {
            // Add the shipping fee
            details.displayItems.push(shippingOption);
            // TODO: Sum
            // details.total.amount.value += item.amount.value;
          }

          resolve(details);
        });
      };
      shippingOptionChange = () => {
        return new Promise(resolve => {
          let _option = prap.shippingOption;
          for (let index in details.shippingOptions) {
            let option = details.shippingOptions[index];
            details.shippingOptions[index].selected = option.id === _option ? true : false;
          }
          // There should be only one option. Do nothing.
          resolve(details);
        });
      };
    });

    it('Receives `validatemerchant` event', function(done) {
      let type = 'validatemerchant';
      let dummy = {
        merchantIdentifier: 'merchantIdentifier',
        merchantSessionIdentifier: 'merchantSessionIdentifier',
        nonce: 'nonce',
        domainName: 'domainName',
        epochTimestamp: 'epochTimestamp',
        signiture: 'signiture'
      };
      prap = new PaymentRequestAP(methodData, details, options);
      prap.session.completeMerchantValidation = merchantSession => {
        console.log('completeMerchantValidation', merchantSession);
        expect(merchantSession).deep.equals({
          merchantIdentifier: 'merchantIdentifier',
          merchantSessionIdentifier: 'merchantSessionIdentifier',
          nonce: 'nonce',
          domainName: 'domainName',
          epochTimestamp: 'epochTimestamp',
          signiture: 'signiture'
        });
        done();
      };
      prap[`on${type}`] = e => {
        // Assume server validated the merchant
        prap.completeMerchantValidation(dummy);
      };
      prap.onValidateMerchant({preventDefault: _ => {
        console.log('prevent validatemerchant called.');
      }});
    });

    it('Receives `paymentmethodselected` event', function(done) {
      let type = 'paymentmethodselected';
      // dummy: PaymentMethod
      let dummy = {
        displayName: 'Dummy credit card',
        network: 'visa',
        type: 'credit',
        paymentPass: {
          primaryAccountIdentifier: '',
          primaryAccountNumberSuffix: '',
          deviceAccountIdentifier: '',
          deviceAccountNumberSuffix: '',
          activationState: 'activated'
        }
      };
      let dummyTotal = {};
      let dummyLineItems = [];
      prap = new PaymentRequestAP(methodData, details, options);
      prap.session.completePaymentMethodSelection = (newTotal, newLineItems) => {
        console.log('completePaymentMethodSelection', newTotal, newLineItems);
        expect(newTotal).deep.equals(dummyTotal);
        expect(newLineItems).deep.equals(dummyLineItems);
        done();
      };
      prap[`on${type}`] = e => {
        e.paymentMethod;
        prap.completePaymentMethodSelection(dummyTotal, dummyLineItems);
      };
      prap.onPaymentMethodSelected({
        preventDefault: _ => {
          console.log('prevent paymentmethodselected called.');
        },
        paymentMethod: dummy
      });
    });

    it('Receives `shippingcontactselected` event', function(done) {
      let type = 'shippingcontactselected';
      /**
       * interface PaymentContact {
       * emailAddress: string;
       * phoneNumber: string;
       * familyName: string;
       * givenName: string;
       * addressLines: string[];
       * locality: string;
       * postalCode: string;
       * administrativeArea: string;
       * country: string;
       * countryCode: string;
       * }
       */
      let dummy = {
        emailAddress:'chromedemojp@gmail.com',
        phoneNumber: '1111-1111',
        familyName: 'Piko',
        givenName: 'Taro',
        addressLines: ['1600 Amphitheatre Parkway'],
        locality: '',
        postalCode: '94043',
        administrativeArea: 'CA',
        country: 'United States of America',
        countryCode: 'US'
      };
      prap = new PaymentRequestAP(methodData, details, options);
      prap.session.completeShippingContactSelection = (status, shippingMethods, newTotal, newLineItems) => {
        console.log('completeShippingContactSelection', status, shippingMethods, newTotal, newLineItems);
        expect(status).equal('SUCCESS');
        expect(shippingMethods).deep.equal([{
          identifier: 'standard',
          label: 'Standard shipping',
          detail: 'Standard shipping',
          amount: '0.0'
        }, {
          identifier: 'express',
          label: 'Express shipping',
          detail: 'Express shipping',
          amount: '10.0'
        }]);
        expect(newTotal).deep.equal({
          label: 'total',
          type: 'final',
          amount: '55.00'
        });
        expect(newLineItems).deep.equal([{
          label: 'Original donation amount',
          type: 'pending',
          amount: '65.00'
        }, {
          label: 'Friends and family discount',
          type: 'final',
          amount: '-10.00'
        }]);
        done();
      };
      prap['onshippingaddresschange'] = e => {
        e.updateWith(shippingAddressChange());
      };
      prap.onShippingAddressOrOptionChange({
        preventDefault: _ => {
          console.log('prevent shippingcontactselected called.');
        },
        shippingContact: dummy,
        type: type
      });
    });

    it('Receives `shippingmethodselected` event', function(done) {
      let type = 'shippingmethodselected';
      let dummy = 'express';
      prap = new PaymentRequestAP(methodData, details, options);
      prap.session.completeShippingMethodSelection = (status, newTotal, newLineItems) => {
        console.log('completeShippingMethodSelection', status, newTotal, newLineItems);
        expect(status).equal('SUCCESS');
        expect(newTotal).deep.equal({
          label: 'total',
          type: 'final',
          amount: '55.00'});
        expect(newLineItems).deep.equal([{
          label: 'Original donation amount',
          type: 'pending',
          amount: '65.00'
        }, {
          label: 'Friends and family discount',
          type: 'final',
          amount: '-10.00'
        }]);
        done();
      };
      prap['onshippingoptionchange'] = e => {
        e.updateWith(shippingOptionChange());
      };
      prap.onShippingAddressOrOptionChange({
        preventDefault: _ => {
          console.log('prevent paymentmethodselected called.');
        },
        shippingOption: dummy,
        type: type
      });
    });

    it('Receives `shippingaddresschange` event', function(done) {
      let type = 'shippingaddresschange';
      prap = new PaymentRequestAP(methodData, details, options);
      prap.session.completePaymentMethodSelection = assertResult(done, type);
      prap[`on${type}`] = eventHandler;
      prap.onShippingAddressOrOptionChange({preventDefault: _ => {
        console.log(`prevent ${type} called.`);
      }});
    });

    it('Receives `shippingoptionchange` event', function(done) {
      let type = 'shippingoptionchange';
      prap = new PaymentRequestAP(methodData, details, options);
      prap.session.completePaymentMethodSelection = assertResult(done, type);
      prap[`on${type}`] = eventHandler;
      prap.onShippingAddressOrOptionChange({preventDefault: _ => {
        console.log(`prevent ${type} called.`);
      }});
    });

    it('Receives `paymentauthorized` event', function(done) {
      let type = 'paymentauthorized';
      prap = new PaymentRequestAP(methodData, details, options);
      prap.session.completePaymentMethodSelection = assertResult(done, type);
      prap[`on${type}`] = eventHandler;
      prap.onPaymentAuthorized({preventDefault: _ => {
        console.log(`prevent ${type} called.`);
      }});
    });

    it('Receives `cancel` event', function(done) {
      let type = 'cancel';
      prap = new PaymentRequestAP(methodData, details, options);
      prap.session.completePaymentMethodSelection = assertResult(done, type);
      prap[`on${type}`] = eventHandler;
      prap.onPaymentMethodSelected({preventDefault: _ => {
        console.log(`prevent ${type} called.`);
      }});
    });
  });
});
