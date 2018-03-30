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

const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const request = require('request');

// Replace these params based on your own configuration
const APPLE_PAY_CERTIFICATE_PATH = "./certs/apple-pay-cert.pem";
const MERCHANT_IDENTIFIER = "merchant.com.agektmr.payment";
const MERCHANT_DOMAIN = "web-payment-apis.appspot.com";
const MERCHANT_DIAPLAY_NAME = "web-payment-apis.appspot.com";

try {
  fs.accessSync(APPLE_PAY_CERTIFICATE_PATH);
} catch (e) {
  throw new Error('Apple Pay Merchant Identity Certificate is missing.');
}

const cert = fs.readFileSync(APPLE_PAY_CERTIFICATE_PATH);

const app = express();
app.use(bodyParser.json());
app.enable('trust proxy');
app.use(function(req, res, next) {
  if (!req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});
app.use(express.static(path.join(__dirname, 'demo'), {
  setHeaders: function(res) {
    res.set('Strict-Transport-Security', 'max-age=31536000');
  }
}));

app.get('/.well-known/apple-developer-merchantid-domain-association', (req, res) => {
  let file = fs.readFileSync('./demo/well-known/apple-developer-merchantid-domain-association');
  res.send(file);
});


app.post('/applepay/validate/', function (req, res) {
  if (!req.body.validationURL) return res.sendStatus(400);

  const options = {
    url: req.body.validationURL,
    cert: cert,
    key: cert,
    method: 'POST',
    body: {
      merchantIdentifier: MERCHANT_IDENTIFIER,
      domainName: MERCHANT_DOMAIN,
      displayName: MERCHANT_DIAPLAY_NAME
    },
    json: true
  };

  request(options, function(err, response, body) {
    if (err) {
      console.log(err, response, body);
      res.status(500).send(body);
    }
    res.send(body);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT);

console.log(`serving from port ${PORT}`);