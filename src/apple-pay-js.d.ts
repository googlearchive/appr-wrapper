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

interface ApplePaySession extends EventTarget {
  abort(): void;
  begin(): void;
  completeMerchantValidation(merchantSession: MerchantSession): void;
  completePayment(status: number): void;
  completePaymentMethodSelection(newTotal: LineItem, newLineItems: LineItem[] | null): void;
  completeShippingContactSelection(
    status: number,
    newShippingMethods: ShippingMethod[],
    newTotal: LineItem,
    newLineItems: LineItem[] | null
  ): void;
  completeShippingMethodSelection(
    status: number,
    newTotal: LineItem,
    newLineItems: LineItem[] | null
  ): void;
  oncancel(): void;
  onpaymentauthorized(e: ApplePayPaymentAuthorizedEvent): void;
  onpaymentmethodselected(e: ApplePayPaymentMethodSelectedEvent): void;
  onpshippingcontactselected(e: ApplePayShippingContactSelectedEvent): void;
  onshippingmethodselected(e: ApplePayPaymentMethodSelectedEvent): void;
  onvalidatemerchant(e: ApplePayValidateMerchantEvent): void;
}

declare const ApplePaySession: {
  prototype: ApplePaySession;
  new(
    /**
     * Version number. The version of the ApplePay JS API you are using. The
     * current API version number is 2.
     */
    version: number,
    /**
     * A PaymentRequest object that contains the information that is displayed
     * on the Apple Pay payment sheet.
     */
    paymentRequest: ApplePayJS.PaymentRequest
  ): ApplePaySession;
  canMakePayments(): boolean;
  canMakePaymentsWithActiveCard(merchantIdentifier: string): Promise<boolean>;
  openPaymentSetup(merchantIdentifier: string): Promise<boolean>;
  /**
   * Verifies if a web browser supports a given Apple Pay JS API version.
   * @param {number} version A number representing the Apple Pay JS API version being checked. The initial version is 1.
   * @returns {boolean}
   */
  supportsVersion(version: number): boolean;
  readonly STATUS_SUCCESS: number;
  readonly STATUS_FAILURE: number;
  readonly STATUS_INVALID_BILLING_POSTAL_ADDRESS: number;
  readonly STATUS_INVALID_SHIPPING_POSTAL_ADDRESS: number;
  readonly STATUS_INVALID_SHIPPING_CONTACT: number;
}

interface LineItem {
  type?: 'pending' | 'final';
  label: string;
  amount: string;
}

interface MerchantSession {
  merchantIdentifier: string;
  merchantSessionIdentifier: string;
  nonce: number;
  domainName: string;
  epochTimestamp: number;
  signature: string;
}

interface Payment {
  token: PaymentToken;
  billingContact: PaymentContact;
  shippingContact: PaymentContact;
}

/**
 * Encapsulates contact information needed for billing and shipping.
 * https://developer.apple.com/reference/applepayjs/paymentcontact
 */
interface PaymentContact {
  /**
   * An email address for the contact.
   */
  emailAddress: string;
  /**
   * The contact’s family name.
   */
  familyName: string;
  /**
   * The contact’s given name.
   */
  givenName: string;
  /**
   * A phone number for the contact.
   */
  phoneNumber: string;
  /**
   * The address for the contact.
   */
  addressLines: string[];
  /**
   * The city for the contact.
   */
  locality: string;
  /**
   * The state for the contact.
   */
  administrativeArea: string;
  /**
   * The zip code, where applicable, for the contact.
   */
  postalCode: string;
  /**
   * The colloquial country name for the contact.
   */
  country: string;
  /**
   * The contact’s ISO country code.
   */
  countryCode: string;
}

/**
 * Payment pass activation states.
 * https://developer.apple.com/reference/applepayjs/paymentpassactivationstate
 */
type PaymentPassActivationState =
  // Active and ready to be used for payment.
  'activated' |
  // Not active but may be activated by the issuer.
  'requiresActivation' |
  // Not ready for use but activation is in progress.
  'activating' |
  // Not active and can't be activated.
  'suspended' |
  // Not active because the issuer has disabled the account associated with the device.
  'deactivated';

/**
 * Represents a provisioned payment card for Apple Pay payments.
 * https://developer.apple.com/reference/applepayjs/paymentpass
 */
interface PaymentPass {
  /**
   * The unique identifier for the primary account number for the payment card.
   * https://developer.apple.com/reference/applepayjs/paymentpass/2216115-primaryaccountidentifier
   */
  primaryAccountIdentifier: string;
  /**
   * A version of the primary account number suitable for display in your UI.
   * https://developer.apple.com/reference/applepayjs/paymentpass/2216116-primaryaccountnumbersuffix
   * Note that this value is typically the last four or five digits of the
   * account number, but the number of digits can vary by issuer. This value is
   * not related to the value of the primaryAccountIdentifier value.
   */
  primaryAccountNumberSuffix: string;
  /**
   * The unique identifier for the device-specific account number.
   * https://developer.apple.com/reference/applepayjs/paymentpass/2216117-deviceaccountidentifier
   * This number is not the account number itself. If the pass has not been
   * provisioned, the value of this property is nil.
   */
  deviceAccountIdentifier: string;
  /**
   * A version of the device account number suitable for display in your UI.
   * https://developer.apple.com/reference/applepayjs/paymentpass/2216118-deviceaccountnumbersuffix
   * This value is typically the last four or five digits of the device account
   * number, but the number of digits can vary by issuer.
   */
  deviceAccountNumberSuffix?: string;
  /**
   * The activation state of the pass.
   * https://developer.apple.com/reference/applepayjs/paymentpass/2216119-activationstate
   * The activation state is of type PaymentPassActivationState.
   */
  activationState: PaymentPassActivationState;
}

/**
 * Contains information about Apple Pay cards.
 * https://developer.apple.com/reference/applepayjs/paymentmethod
 */
interface PaymentMethod {
  /**
   * A string, suitable for display, that describes the card.
   */
  displayName: string;
  /**
   * A string, suitable for display, that is the name of the payment network
   * backing the card. The value is one of the supported networks specified in
   * the supportedNetworks property of the PaymentRequest.
   */
  network: string;
  /**
   * A value representing the card's type of payment. The value is one of debit,
   * credit, prepaid, or store.
   */
  type: 'debit' | 'credit' | 'prepaid' | 'store';
  /**
   * The payment pass object associated with the payment.
   */
  paymentPass: PaymentPass;
}

/**
 * Contains the user's payment credentials.
 * https://developer.apple.com/reference/applepayjs/paymenttoken
 * You access the payment token for an authorized payment request using the
 * token property of the Payment object.
 */
interface PaymentToken {
  /**
   * An object containing the encrypted payment data.
   * https://developer.apple.com/reference/applepayjs/paymenttoken/1916115-paymentdata
   */
  paymentData: {};
  /**
   * Information about the card used in the transaction.
   * https://developer.apple.com/reference/applepayjs/paymenttoken/1916113-paymentmethod
   */
  paymentMethod: PaymentMethod;
  /**
   * A unique identifier for this payment.
   * https://developer.apple.com/reference/applepayjs/paymenttoken/1916114-transactionidentifier
   */
  transactionIdentifier: string;
}

interface ApplePayPaymentAuthorizedEvent extends Event {
  readonly payment: Payment;
}

interface ApplePayPaymentMethodSelectedEvent extends Event {
  paymentMethod: PaymentMethod;
}

interface ApplePayShippingContactSelectedEvent extends Event {
  readonly shippingContact: PaymentContact;
}

interface ApplePayShippingMethodSelectedEvent extends Event {
  readonly shippingMethod: ShippingMethod;
}

interface ApplePayValidateMerchantEvent extends Event {
  readonly validationURL: string;
}

type MerchantCapability =
  // Required. This value must be supplied.
  'supports3DS' |
  // Optional. If present, only transactions that are categorized as credit
  // cards are allowed.
  'supportsCredit' |
  // Optional. If present, only transactions that are categorized as debit cards
  // are allowed.
  'supportsDebit' |
  // Include this value only if you support China Union Pay transactions.
  'supportsEMV';

type SupportedNetwork =
  'amex' |
  'discover' |
  'jcb' |
  'masterCard' |
  'privateLabel' |
  'visa';

type ShippingType =
  'shipping' |
  'delivery' |
  'storePickup' |
  'servicePickup';

declare namespace ApplePayJS {
  /**
   * Encapsulates a request for payment, including information about payment
   * processing capabilities, the payment amount, and shipping information.
   * https://developer.apple.com/reference/applepayjs/paymentrequest
   */
  interface PaymentRequest {
    /**
     * The merchant’s two-letter ISO 3166 country code.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916117-countrycode
     * Set this property to the two-letter country code. The country code is
     * validated.
     */
    countryCode: string;
    /**
     * The three-letter ISO 4217 currency code for the payment.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916118-currencycode
     * Set this property to the three-letter code for the currency used by this
     * payment request. Apple Pay interprets the amounts provided by the summary
     * items in this request as amounts in this currency.
     */
    currencyCode?: string;
    /**
     * A set of line items that explain recurring payments and additional
     * charges.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916120-lineitems
     */
    lineItems?: LineItem[];
    /**
     * The payment capabilities supported by the merchant. The value must be
     * supports3DS, and may optionally include supportsCredit, supportsDebit, or
     * supportsEMV.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916123-merchantcapabilities
     * If both or neither supportsCredit and supportsDebit values are supplied,
     * the transaction allows both credit and debit cards.
     */
    merchantCapabilities: MerchantCapability[];
    /**
     * The payment networks supported by the merchant. The value must be one or
     * more of amex, discover, jcb, masterCard, privateLabel, or visa.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916122-supportednetworks
     */
    supportedNetworks: string[]; // SupportedNetwork[]
    /**
     * The total amount for the payment. The total must be greater than zero and
     * have a label to pass validation.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916119-total
     */
    total: LineItem;
    /**
     * Billing contact information for the user.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916125-billingcontact
     */
    billingContact?: PaymentContact;
    /**
     * The billing information that you require from the user in order to
     * process the transaction.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/2216120-requiredbillingcontactfields
     */
    requiredBillingContactFields?: ('postalAddress' | 'name')[];
    /**
     * The shipping information that you require from the user in order to
     * fulfill the order.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/2216121-requiredshippingcontactfields
     */
    requiredShippingContactFields?: ('postalAddress' | 'name' | 'phone' | 'email')[];
    /**
     * Shipping contact information for the user.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916127-shippingcontact
     */
    shippingContact?: PaymentContact;
    /**
     * A set of available shipping methods. Totals for all shipping methods must
     * be non-negative to pass validation.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916121-shippingmethods
     */
    shippingMethods?: ShippingMethod[];
    /**
     * How the items are to be shipped. This property is optional. If specified,
     * it must be one or more of shipping, delivery, storePickup, or
     * servicePickup. The default value is shipping.
     * https://developer.apple.com/reference/applepayjs/paymentrequest/1916128-shippingtype
     */
    shippingType?: ShippingType;
  }
}

/**
 * Defines the keys used to identify the shipping method.
 * https://developer.apple.com/reference/applepayjs/applepay_js_data_types/shippingmethod
 */
interface ShippingMethod {
  /**
   * The label used by the shipping method.
   */
  label: string;
  /**
   * Any additional shipping information to be displayed in the Apple Pay sheet.
   */
  detail: string;
  /**
   * The amount associated with a line item. The value must be a positive
   * number that follows the regular expression ?[0-9]+(\.[0-9][0-9])?.
   */
  amount: string;
  /**
   * A client-defined identifier.
   */
  identifier: string;
}

interface Window {
  ApplePaySession: ApplePaySession;
}