const https = require('https');
const mpesaConfig = require('../config/mpesa');

class MpesaService {
  constructor() {
    this.accessToken = null;
    this.tokenExpiryTime = null;
  }

  /**
   * Get OAuth access token from M-Pesa API
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiryTime && Date.now() < this.tokenExpiryTime) {
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      const auth = Buffer.from(
        `${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`
      ).toString('base64');

      const options = {
        hostname: 'sandbox.safaricom.co.ke',
        port: 443,
        path: '/oauth/v1/generate?grant_type=client_credentials',
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.access_token) {
              this.accessToken = response.access_token;
              // Set expiry to 55 minutes (token valid for 60 minutes)
              this.tokenExpiryTime = Date.now() + 55 * 60 * 1000;
              resolve(response.access_token);
            } else {
              reject(new Error('Failed to get access token'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  }

  /**
   * Initiate STK push payment
   */
  async initiateStkPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const payload = {
        BusinessShortCode: mpesaConfig.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: mpesaConfig.shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: mpesaConfig.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'sandbox.safaricom.co.ke',
          port: 443,
          path: '/mpesa/stkpush/v1/processrequest',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              resolve(response);
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Query payment status
   */
  async queryPaymentStatus(checkoutRequestId) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const payload = {
        BusinessShortCode: mpesaConfig.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      return new Promise((resolve, reject) => {
        const options = {
          hostname: 'sandbox.safaricom.co.ke',
          port: 443,
          path: '/mpesa/stkpushquery/v1/query',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              resolve(response);
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.write(JSON.stringify(payload));
        req.end();
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate timestamp in format: YYYYMMDDHHmmss
   */
  generateTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${date}${hours}${minutes}${seconds}`;
  }

  /**
   * Generate password: Base64(ShortCode + Passkey + Timestamp)
   */
  generatePassword(timestamp) {
    const password = `${mpesaConfig.shortCode}${mpesaConfig.passkey}${timestamp}`;
    return Buffer.from(password).toString('base64');
  }
}

module.exports = new MpesaService();
