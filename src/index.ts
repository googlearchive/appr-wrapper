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

/// <reference path="./payment-request.d.ts"/>
/// <reference path="./apple-pay-js.d.ts"/>

let PR = window.PaymentRequest;

export let PaymentRequest;

if (window.ApplePaySession) {
  PaymentRequest = class {
    private paymentRequest: ApplePayJS.PaymentRequest;
    public paymentRequestID: string = '';
    public shippingAddress: PaymentAddress = null;
    public shippingOption: string = '';
    public shippingType: PaymentShippingType = 'shipping';
    private session: ApplePaySession;
    private paymentResolver = null;
    private paymentRejector = null;
    public onshippingaddresschange = null;
    public onshippingoptionchange = null;
    public onpaymentmethodselected = null;

    private validationEndpoint: string = '';
    private merchantIdentifier: string = '';

    /**
     * @param  {PaymentMethodData[]} methodData
     * @param  {PaymentDetails} details
     * @param  {PaymentOptions} options
     */
    constructor(
      methodData: PaymentMethodData[],
      details: PaymentDetails,
      options: PaymentOptions
    ) {
      this.paymentRequest = {
        countryCode: '',
        currencyCode: '',
        lineItems: [],
        merchantCapabilities: ['supports3DS'],
        supportedNetworks: [],
        total: null,
        billingContact: null,
        requiredBillingContactFields: [],
        requiredShippingContactFields: [],
        shippingContact: null,
        shippingMethods: [],
        shippingType: 'shipping',
      };

      // methodData
      for (let method of methodData) {
        // If `supportedMethods` includes `https://apple.com/apple-pay`...
        if (method.supportedMethods.indexOf('https://apple.com/apple-pay') > -1) {
          this.paymentRequest.supportedNetworks = method.data.supportedNetworks;
          this.paymentRequest.countryCode = method.data.countryCode;
          if (method.data.billingContact) {
            this.paymentRequest.billingContact = method.data.billingContact;
          } else {
            delete this.paymentRequest.billingContact;
          }
          if (method.data.shippingContact) {
            this.paymentRequest.shippingContact = method.data.shippingContact;
          } else {
            delete this.paymentRequest.shippingContact;
          }
          if (method.data.merchantCapabilities) {
            this.paymentRequest.merchantCapabilities = method.data.merchantCapabilities;
          }

          this.validationEndpoint = method.data.validationEndpoint;
          this.merchantIdentifier = method.data.merchantIdentifier;
          break;
        }
      }

      // details
      if (details) {
        this.updatePaymentDetails(details);
      }

      // options
      if (options) {
        if (options.requestShipping) {
          this.paymentRequest.requiredBillingContactFields.push('postalAddress');
          this.paymentRequest.requiredShippingContactFields.push('postalAddress');
        }
        if (options.requestPayerName) {
          this.paymentRequest.requiredBillingContactFields.push('name');
          this.paymentRequest.requiredShippingContactFields.push('name');
        }
        if (options.requestPayerEmail) {
          this.paymentRequest.requiredShippingContactFields.push('email');
        }
        if (options.requestPayerPhone) {
          this.paymentRequest.requiredShippingContactFields.push('phone');
        }
        if (options.shippingType === 'pickup') {
          this.paymentRequest.shippingType = 'servicePickup';
        } else {
          this.paymentRequest.shippingType = options.shippingType || 'shipping';
        }
      }

      this.session = new ApplePaySession(1, this.paymentRequest);

      this.session.addEventListener('validatemerchant',
        this.onValidateMerchant.bind(this));
      this.session.addEventListener('paymentauthorized',
        this.onPaymentAuthorized.bind(this));
      this.session.addEventListener('paymentmethodselected',
        this.onPaymentMethodSelected.bind(this));
      this.session.addEventListener('shippingcontactselected',
        this.onShippingAddressChange.bind(this));
      this.session.addEventListener('shippingmethodselected',
        this.onShippingOptionChange.bind(this));
      this.session.addEventListener('cancel',
        this.onPaymentCanceled.bind(this));
    }

    /**
     * @param  {PaymentDetails} details
     */
    private updatePaymentDetails(details: PaymentDetails) {
      let codes = false;
      if (details.displayItems) {
        this.paymentRequest.lineItems = [];
        for (let item of details.displayItems) {
          if (!codes) {
            this.paymentRequest.currencyCode = item.amount.currency;
          }
          let lineItem: LineItem = {
            type: item.pending === true ? 'pending' : 'final',
            label: item.label,
            amount: item.amount.value
          }
          this.paymentRequest.lineItems.push(lineItem);
        }
      }

      if (details.shippingOptions) {
        this.paymentRequest.shippingMethods = [];
        for (let option of details.shippingOptions) {
          let shippingMethod: ShippingMethod = {
            label: option.label,
            detail: option.label,
            amount: option.amount.value,
            identifier: option.id
          };
          this.paymentRequest.shippingMethods.push(shippingMethod);
        }
      }

      if (details.total) {
        this.paymentRequest.total = {
          type: details.total.pending === true ? 'pending' : 'final',
          label: details.total.label,
          amount: details.total.amount.value
        };
      }
    }

    /**
     * @param  {PaymentMethod} paymentMethod
     */
    private updatePaymentMethod(paymentMethod: PaymentMethod) {

    }

    /**
     * @param  {PaymentContact} shippingContact
     */
    private convertShippingContact(contact: PaymentContact): PaymentAddress {
      return {
        country:            contact.countryCode || '',
        addressLine:        contact.addressLines || [],
        region:             contact.administrativeArea || '',
        city:               contact.locality || '',
        dependentLocality:  '',
        postalCode:         contact.postalCode || '',
        sortingCode:        contact.country || '',
        languageCode:       '',
        organization:       '',
        recipient:          `${contact.givenName} ${contact.familyName}`,
        phone:              contact.phoneNumber || ''
      }
    }

    /**
     * @param  {ShippingMethod} shippingMethod
     */
    private convertShippingMethod(shippingMethod: ShippingMethod): string {
      for (let method of this.paymentRequest.shippingMethods) {
        if (shippingMethod.identifier === method.identifier) {
          return method.identifier;
        }
      }
      return '';
    }

    /**
     * @returns Promise
     */
    public show(): Promise<PaymentResponse> {
      this.session.begin();
      return new Promise((resolve, reject) => {
        this.paymentResolver = (response: Payment) => {
          resolve(response);
        };
        this.paymentRejector = (error: Error) => {
          reject(error);
        };
      });
    }

    /**
     * @returns Promise
     */
    public abort(): void {
      // TODO: Should this return a promise?
      // TODO: Does `cancel` event fire by itself?
      this.session.abort();
    }

    /**
     * @returns Promise
     */
    public canMakePayment(): Promise<boolean> {
      if (this.merchantIdentifier) {
        return ApplePaySession.canMakePaymentsWithActiveCard(this.merchantIdentifier);
      } else {
        throw '`merchantIdentifier` is not specified.';
      }
    }

    public completeMerchantValidation(merchantSession: MerchantSession): void {
      // https://developer.apple.com/reference/applepayjs/applepaysession/1778015-completemerchantvalidation
      this.session.completeMerchantValidation(merchantSession);
    }

    public completePaymentMethodSelection(newTotal: LineItem, newLineItems: LineItem[]): void {
      // https://developer.apple.com/reference/applepayjs/applepaysession/1777995-completepaymentmethodselection
      this.session.completePaymentMethodSelection(newTotal, newLineItems);
    }

    /**
     * @param  {string} type
     * @param  {(e:Event)=>any} callback
     * @returns void
     */
    public addEventListener(type: string, callback: (e: Event) => any): void {
      if (type === 'shippingaddresschange' ||
          type === 'shippingoptionchange' ||
          type === 'paymentmethodselected' ||
          type === 'validatemerchant') {
        this[`on${type}`] = callback;
      } else {
        throw `Unknown event type "${type}" for \`addEventListener\`.`;
      }
    }

    /**
     * @param  {ApplePayValidMerchantEvent} e
     * @returns void
     */
    private onValidateMerchant(e: ApplePayValidateMerchantEvent): void {
      e.stopPropagation();
      // https://developer.apple.com/reference/applepayjs/applepaysession/1778021-onvalidatemerchant
      if (this['onvalidatemerchant']) {
        this['onvalidatemerchant'](e);
      } else {
        fetch(this.validationEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({validationURL: e.validationURL})
        }).then(res => {
          if (res.status === 200) {
            return res.json();
          } else {
            throw 'Merchant validation error.';
          }
        }).then((merchantSession: any) => {
          this.completeMerchantValidation(<MerchantSession>merchantSession);
        }).catch(error => {
          throw error;
        });
      }
    }

    /**
     * @param  {ApplePayPaymentMethodSelectedEvent} e
     * @returns void
     */
    private onPaymentMethodSelected(e: ApplePayPaymentMethodSelectedEvent): void {
      e.stopPropagation();
      // https://developer.apple.com/reference/applepayjs/applepaysession/1778013-onpaymentmethodselected
      if (this['onpaymentmethodselected']) {
        this['onpaymentmethodselected'](e);
      } else {
        let newTotal = this.paymentRequest.total;
        let newLineItems = this.paymentRequest.lineItems;
        this.session.completePaymentMethodSelection(newTotal, newLineItems);
      }
    }

    /**
     * @param  {ApplePayShippingContactSelectedEvent} e
     * @returns void
     */
    private onShippingAddressChange(
      e: ApplePayShippingContactSelectedEvent
    ): void {
      if (!this['onshippingaddresschange']) return;
      e.stopPropagation();

      // Convert ApplePay ShippingContact into PaymentRequest PaymentAddress
      // https://developer.apple.com/reference/applepayjs/applepaysession/1778009-onshippingcontactselected
      let shippingContact = e.shippingContact;
      this.shippingAddress = this.convertShippingContact(shippingContact);

      this['onshippingaddresschange']({
        updateWith: p => {
          p.then((details: PaymentDetails) => {
            // https://developer.apple.com/reference/applepayjs/applepaysession/1778008-completeshippingcontactselection
            this.updatePaymentDetails(details);
            this.session.completeShippingContactSelection(
              ApplePaySession.STATUS_SUCCESS,
              this.paymentRequest.shippingMethods,
              this.paymentRequest.total,
              this.paymentRequest.lineItems);
          }, (details: PaymentDetails) => {
            // TODO: In which case does this happen?
            // https://developer.apple.com/reference/applepayjs/applepaysession/1778008-completeshippingcontactselection
            this.updatePaymentDetails(details);
            this.session.completeShippingContactSelection(
              ApplePaySession.STATUS_FAILURE,
              this.paymentRequest.shippingMethods,
              this.paymentRequest.total,
              this.paymentRequest.lineItems);
          });
        }
      });
    }

    /**
     * @param  {ApplePayShippingMethodSelectedEvent} e
     * @returns void
     */
    private onShippingOptionChange(
      e: ApplePayShippingMethodSelectedEvent
    ): void {
      if (!this['onshippingoptionchange']) return;
      e.stopPropagation();

      // Convert ApplePay ShippingMethod into PaymentRequest PaymentShippingOption id
      // https://developer.apple.com/reference/applepayjs/applepaysession/1778028-onshippingmethodselected
      let shippingMethod = e.shippingMethod;
      this.shippingOption = this.convertShippingMethod(shippingMethod);

      this['onshippingoptionchange']({
        updateWith: p => {
          p.then((details: PaymentDetails) => {
            // https://developer.apple.com/reference/applepayjs/applepaysession/1778024-completeshippingmethodselection
            this.updatePaymentDetails(details);
            this.session.completeShippingMethodSelection(
              ApplePaySession.STATUS_SUCCESS,
              this.paymentRequest.total,
              this.paymentRequest.lineItems);
          });
        }
      })
    }

    /**
     * @param  {ApplePayPaymentAuthorizedEvent} e
     * @returns void
     */
    private onPaymentAuthorized(e: ApplePayPaymentAuthorizedEvent): void {
      if (this.paymentResolver) {
        // https://developer.apple.com/reference/applepayjs/payment
        this.paymentResolver(e.payment);
        this.paymentResolver = null;
        this.paymentRejector = null;
      }
    }

    /**
     * @returns void
     */
    private onPaymentCanceled(): void {
      if (this.paymentRejector) {
        this.paymentRejector();
        this.paymentResolver = null;
        this.paymentRejector = null;
      }
    }

    /**
     * @param  {PaymentComplete} result
     * @returns void
     */
    private onPaymentComplete(result: PaymentComplete): void {
      if (result === 'success' ||
          result === 'fail' ||
          result === 'unknown') {
        let status: number;
        switch (result) {
          case 'success':
            status = ApplePaySession.STATUS_SUCCESS;
            break;
          case 'fail':
            status = ApplePaySession.STATUS_FAILURE;
            break;
          case 'unknown':
            // TODO: What to do if dev indicates 'unknown'?
            status = ApplePaySession.STATUS_FAILURE;
            break;
        }
        // https://developer.apple.com/reference/applepayjs/applepaysession/1778012-completepayment
        this.session.completePayment(status);
      } else {
        throw 'Unkown status code for complete().';
      }
    }
  }
} else {
  PaymentRequest = PR;
}
