module.exports = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  apiBaseUrl: process.env.MPESA_API_BASE_URL || 'https://sandbox.safaricom.co.ke',
  shortCode: process.env.MPESA_SHORT_CODE || '174379',
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
};
