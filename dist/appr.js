(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
if (window.ApplePaySession && !ApplePaySession.supportsVersion(3)) {
    var APPLE_PAY_JS_IDENTIFIER_1 = 'https://apple.com/apple-pay';
    exports.PaymentRequest = (function () {
        function class_1(methodData, details, options) {
            this.paymentRequestID = '';
            this.shippingAddress = null;
            this.shippingOption = '';
            this.shippingType = 'shipping';
            this.paymentResolver = null;
            this.paymentRejector = null;
            this.onshippingaddresschange = null;
            this.onshippingoptionchange = null;
            this.onpaymentmethodselected = null;
            this.merchantIdentifier = '';
            var methodSpecified = false;
            this.paymentRequest = {
                countryCode: '',
                currencyCode: '',
                lineItems: [],
                merchantCapabilities: null,
                supportedNetworks: [],
                total: null,
                billingContact: null,
                requiredBillingContactFields: [],
                requiredShippingContactFields: [],
                shippingContact: null,
                shippingMethods: [],
                shippingType: 'shipping',
            };
            for (var _i = 0, methodData_1 = methodData; _i < methodData_1.length; _i++) {
                var method = methodData_1[_i];
                if (method.supportedMethods.indexOf(APPLE_PAY_JS_IDENTIFIER_1) > -1 ||
                    method.supportedMethods === APPLE_PAY_JS_IDENTIFIER_1) {
                    this.paymentRequest.supportedNetworks = method.data.supportedNetworks;
                    this.paymentRequest.countryCode = method.data.countryCode;
                    if (method.data.version !== 3) {
                        throw 'Apple Pay needs to be version 3.';
                    }
                    if (method.data.billingContact) {
                        this.paymentRequest.billingContact = method.data.billingContact;
                    }
                    else {
                        delete this.paymentRequest.billingContact;
                    }
                    if (method.data.shippingContact) {
                        this.paymentRequest.shippingContact = method.data.shippingContact;
                    }
                    else {
                        delete this.paymentRequest.shippingContact;
                    }
                    if (method.data.merchantCapabilities) {
                        this.paymentRequest.merchantCapabilities = method.data.merchantCapabilities;
                    }
                    this.merchantIdentifier = method.data.merchantIdentifier;
                    methodSpecified = true;
                    break;
                }
            }
            if (!methodSpecified) {
                throw 'Payment method not specified for Apple Pay.';
            }
            if (details) {
                this.updatePaymentDetails(details);
            }
            if (options) {
                if (options.requestShipping) {
                    this.paymentRequest.requiredBillingContactFields.push('postalAddress');
                    this.paymentRequest.requiredShippingContactFields.push('postalAddress');
                }
                if (options.requestPayerName) {
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
                }
                else {
                    this.paymentRequest.shippingType = options.shippingType || 'shipping';
                }
            }
            this.session = new ApplePaySession(1, this.paymentRequest);
            this.session.addEventListener('validatemerchant', this.onMerchantValidation.bind(this));
            this.session.addEventListener('paymentauthorized', this.onPaymentAuthorized.bind(this));
            this.session.addEventListener('paymentmethodselected', this.onPaymentMethodSelected.bind(this));
            this.session.addEventListener('shippingcontactselected', this.onShippingAddressChange.bind(this));
            this.session.addEventListener('shippingmethodselected', this.onShippingOptionChange.bind(this));
            this.session.addEventListener('cancel', this.onPaymentCanceled.bind(this));
        }
        class_1.prototype.updatePaymentDetails = function (details, selectedMethod) {
            if (selectedMethod) {
                var newDisplayItems = [];
                for (var _i = 0, _a = details.displayItems; _i < _a.length; _i++) {
                    var item = _a[_i];
                    var included = false;
                    for (var _b = 0, _c = this.preservedDisplayItems; _b < _c.length; _b++) {
                        var _item = _c[_b];
                        if (_item.label === item.label)
                            included = true;
                    }
                    if (!included)
                        newDisplayItems.push(item);
                }
                details.displayItems = newDisplayItems;
                this.preservedDisplayItems = [];
                for (var _d = 0, _e = details.modifiers; _d < _e.length; _d++) {
                    var modifier = _e[_d];
                    if (modifier.supportedMethods !== selectedMethod)
                        continue;
                    if (modifier.additionalDisplayItems) {
                        details.displayItems = details.displayItems.concat(modifier.additionalDisplayItems);
                        this.preservedDisplayItems = modifier.additionalDisplayItems;
                    }
                    if (modifier.total) {
                        details.total = modifier.total;
                    }
                    break;
                }
            }
            if (details.displayItems) {
                this.paymentRequest.lineItems = [];
                for (var _f = 0, _g = details.displayItems; _f < _g.length; _f++) {
                    var item = _g[_f];
                    var lineItem = {
                        type: item.pending === true ? 'pending' : 'final',
                        label: item.label,
                        amount: item.amount.value
                    };
                    this.paymentRequest.lineItems.push(lineItem);
                }
            }
            if (details.shippingOptions) {
                this.paymentRequest.shippingMethods = [];
                for (var _h = 0, _j = details.shippingOptions; _h < _j.length; _h++) {
                    var option = _j[_h];
                    var shippingMethod = {
                        label: option.label,
                        detail: option.label,
                        amount: option.amount.value,
                        identifier: option.id
                    };
                    this.paymentRequest.shippingMethods.push(shippingMethod);
                }
            }
            if (details.total) {
                this.paymentRequest.currencyCode = details.total.amount.currency;
                this.paymentRequest.total = {
                    type: details.total.pending === true ? 'pending' : 'final',
                    label: details.total.label,
                    amount: details.total.amount.value
                };
            }
            else {
                throw '`total` is required parameter for `PaymentDetailsUpdate`.';
            }
            this.preservedDetails = details;
        };
        class_1.prototype.updatePaymentMethod = function (paymentMethod) {
        };
        class_1.prototype.convertPaymentAddress = function (contact) {
            var address = {
                country: contact.countryCode || '',
                addressLine: contact.addressLines || [],
                region: contact.administrativeArea || '',
                city: contact.locality || '',
                dependentLocality: '',
                postalCode: contact.postalCode || '',
                sortingCode: contact.country || '',
                languageCode: '',
                organization: '',
                recipient: contact.givenName + " " + contact.familyName,
                phone: contact.phoneNumber || ''
            };
            return address;
        };
        class_1.prototype.convertShippingMethod = function (shippingMethod) {
            for (var _i = 0, _a = this.paymentRequest.shippingMethods; _i < _a.length; _i++) {
                var method = _a[_i];
                if (shippingMethod.identifier === method.identifier) {
                    return method.identifier;
                }
            }
            return '';
        };
        class_1.prototype.convertPaymentResponse = function (payment) {
            var shippingAddress = this.convertPaymentAddress(payment.shippingContact);
            var billingAddress = this.convertPaymentAddress(payment.billingContact);
            var response = {
                details: {
                    billingAddress: billingAddress
                },
                methodName: APPLE_PAY_JS_IDENTIFIER_1,
                payerEmail: payment.shippingContact.emailAddress,
                payerName: payment.billingContact.givenName + " " + payment.billingContact.familyName,
                payerPhone: payment.shippingContact.phoneNumber,
                shippingAddress: shippingAddress,
                shippingOption: '',
                applePayRaw: payment,
                complete: this.onPaymentComplete.bind(this)
            };
            return response;
        };
        class_1.prototype.show = function () {
            var _this = this;
            this.session.begin();
            return new Promise(function (resolve, reject) {
                _this.paymentResolver = function (response) {
                    resolve(response);
                };
                _this.paymentRejector = function (error) {
                    reject(error);
                };
            });
        };
        class_1.prototype.abort = function () {
            this.session.abort();
        };
        class_1.prototype.canMakePayment = function () {
            if (this.merchantIdentifier) {
                return ApplePaySession.canMakePaymentsWithActiveCard(this.merchantIdentifier);
            }
            else {
                throw '`merchantIdentifier` is not specified.';
            }
        };
        class_1.prototype.addEventListener = function (type, callback) {
            if (type === 'shippingaddresschange' ||
                type === 'shippingoptionchange' ||
                type === 'merchantvalidation') {
                this["on" + type] = callback;
            }
            else {
                throw "Unknown event type \"" + type + "\" for `addEventListener`.";
            }
        };
        class_1.prototype.onMerchantValidation = function (e) {
            var _this = this;
            if (!this['onmerchantvalidation'])
                return;
            e.stopPropagation();
            this['onmerchantvalidation']({
                validationURL: e.validationURL,
                complete: function (p) {
                    p.then(function (merchantSession) {
                        _this.session.completeMerchantValidation(merchantSession);
                    });
                }
            });
        };
        class_1.prototype.onPaymentMethodSelected = function (e) {
            e.stopPropagation();
            this.updatePaymentDetails(this.preservedDetails, 'https://apple.com/apple-pay');
            var newTotal = this.paymentRequest.total;
            var newLineItems = this.paymentRequest.lineItems;
            this.session.completePaymentMethodSelection(newTotal, newLineItems);
        };
        class_1.prototype.onShippingAddressChange = function (e) {
            var _this = this;
            if (!this['onshippingaddresschange'])
                return;
            e.stopPropagation();
            var shippingContact = e.shippingContact;
            this.shippingAddress = this.convertPaymentAddress(shippingContact);
            this['onshippingaddresschange']({
                updateWith: function (p) {
                    p.then(function (details) {
                        _this.updatePaymentDetails(details);
                        _this.session.completeShippingContactSelection(ApplePaySession.STATUS_SUCCESS, _this.paymentRequest.shippingMethods, _this.paymentRequest.total, _this.paymentRequest.lineItems);
                    }, function (details) {
                        _this.updatePaymentDetails(details);
                        _this.session.completeShippingContactSelection(ApplePaySession.STATUS_FAILURE, _this.paymentRequest.shippingMethods, _this.paymentRequest.total, _this.paymentRequest.lineItems);
                    });
                }
            });
        };
        class_1.prototype.onShippingOptionChange = function (e) {
            var _this = this;
            if (!this['onshippingoptionchange'])
                return;
            e.stopPropagation();
            var shippingMethod = e.shippingMethod;
            this.shippingOption = this.convertShippingMethod(shippingMethod);
            this['onshippingoptionchange']({
                updateWith: function (p) {
                    p.then(function (details) {
                        _this.updatePaymentDetails(details);
                        _this.session.completeShippingMethodSelection(ApplePaySession.STATUS_SUCCESS, _this.paymentRequest.total, _this.paymentRequest.lineItems);
                    }, function (details) {
                        _this.updatePaymentDetails(details);
                        _this.session.completeShippingMethodSelection(ApplePaySession.STATUS_FAILURE, null, null);
                    });
                }
            });
        };
        class_1.prototype.onPaymentAuthorized = function (e) {
            if (this.paymentResolver) {
                var response = this.convertPaymentResponse(e.payment);
                this.paymentResolver(response);
                this.paymentResolver = null;
                this.paymentRejector = null;
            }
        };
        class_1.prototype.onPaymentCanceled = function () {
            if (this.paymentRejector) {
                this.paymentRejector();
                this.paymentResolver = null;
                this.paymentRejector = null;
            }
        };
        class_1.prototype.onPaymentComplete = function (result) {
            if (result === 'success' ||
                result === 'fail' ||
                result === 'unknown' ||
                result === '') {
                var status_1;
                switch (result) {
                    case 'success':
                        status_1 = ApplePaySession.STATUS_SUCCESS;
                        break;
                    case 'fail':
                        status_1 = ApplePaySession.STATUS_FAILURE;
                        break;
                    case 'unknown':
                        status_1 = ApplePaySession.STATUS_SUCCESS;
                        break;
                    default:
                        status_1 = ApplePaySession.STATUS_SUCCESS;
                        break;
                }
                this.session.completePayment(status_1);
            }
            else {
                throw 'Unknown status code for complete().';
            }
        };
        return class_1;
    }());
}


/***/ })

/******/ });
});
//# sourceMappingURL=appr.js.map