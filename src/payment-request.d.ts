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

interface PaymentRequest extends EventTarget {
  readonly paymentRequestID: string;
  readonly shippingAddress: PaymentAddress;
  readonly shippingOption: string;
  readonly shippingType: PaymentShippingType;
  show(): Promise<PaymentResponse>;
  abort(): Promise<void>;
  canMakePayment(): Promise<boolean>;
  onshippingaddresschange: (this: Window, ev: Event) => any;
  onshippingoptionchange: (this: Window, ev: Event) => any;
}

declare var PaymentRequest: {
  prototype: PaymentRequest;
  new(
    methodData: PaymentMethodData[],
    details: PaymentDetails,
    options?: PaymentOptions
  ): PaymentRequest;
}

interface PaymentMethodData {
  supportedMethods: string[];
  data?: any;
}

interface PaymentCurrencyAmount {
  currency: string;
  value: string;
  currencySytem?: string;
}

interface PaymentDetails {
  total: PaymentItem;
  displayItems: PaymentItem[];
  shippingOptions: PaymentShippingOption[];
  modifiers?: PaymentDetailsModifier[];
  error?: string;
}

interface PaymentDetailsModifier {
  supportedMethods: string[];
  total?: PaymentItem;
  additionalDisplayItems?: PaymentItem[];
  data?: {};
}

type PaymentShippingType = 'shipping' | 'delivery' | 'pickup';

interface PaymentOptions {
  requestPayerName: boolean;
  requestPayerEmail: boolean;
  requestPayerPhone: boolean;
  requestShipping: boolean;
  shippingType: PaymentShippingType;
}

interface PaymentItem {
  label: string;
  amount: PaymentCurrencyAmount;
  pending?: boolean;
}

interface PaymentAddress {
  readonly country: string;
  readonly addressLine: string[];
  readonly region: string;
  readonly city: string;
  readonly dependentLocality: string;
  readonly postalCode: string;
  readonly sortingCode: string;
  readonly languageCode: string;
  readonly organization: string;
  readonly recipient: string;
  readonly phone: string;
}

interface PaymentShippingOption {
  id: string;
  label: string;
  amount: PaymentCurrencyAmount;
  selected?: boolean;
}

type PaymentComplete = 'success' | 'fail' | 'unknown';

interface PaymentResponse {
  readonly paymentRequestID: string;
  readonly methodName: string;
  readonly details: Object;
  readonly shippingAddress?: PaymentAddress;
  readonly shippingOption?: string;
  readonly payerName: string;
  readonly payerEmail: string;
  readonly payerPhone: string;
  complete(result?: PaymentComplete): Promise<void>;
  toJSON(): Object;
}

interface PaymentRequestUpdateEventInit extends EventInit {
}

interface PaymentRequestUpdateEvent extends Event {
  new(
    type: string,
    eventInitDict?: PaymentRequestUpdateEventInit
  )
  updateWith(detailsPromise: Promise<PaymentDetails>): void;
}

type BasicCardType = 'credit' | 'debit' | 'prepaid';

interface BasicCardRequest {
  supportedNetworks: string[];
  supportedTypes?: BasicCardType[];
}

interface BasicCardResponse {
  cardholderName?: string;
  cardNumber: string;
  expiryMonth?: string;
  expiryYear?: string;
  cardSecurityCode?: string;
  billingAddress?: PaymentAddress;
}

interface Window {
  PaymentRequest?: PaymentRequest;
}