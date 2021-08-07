# OAuth2 and Serverless Quickbooks Apps

#### These are notes taken from a post on the Quickbooks Developer Forum.

The way works with OAuth 2 is different with OAuth 1. When you work with OAuth 1, the expire time of the access token can be set to 180 days. However, for OAuth 2, the expire time is ALWAYS one hour. It CANNOT be changed. Then here comes the question: "what if I need to use it for more than one hour?" You will need to use the refresh token to get a new access token, and use the new access token to make API calls with QuickBooks.

 

1) Why do I need both an access and a refresh key?

In QBO, we call them the refresh token and the access token. The access token is used to make API calls. For example, if you want to create an invoice for a company, you will need to have the access token in your Authorization header. However, access token is always short-lived. Each access token can only be valid for an hour after its creation. If you try to make an API call after an hour with the same access token, the request will be blocked by QBO.

That is what refresh token used for. It is used to request a new access token after access token expired, so you can still access to the QBO company after an hour. Just remember, whenever you make a refreshToken API call, always UPDATE THE REFRESH TOKEN value in your system. In QuickBooks Online OAuth 2 protocol, it is not the access token you should store, it is the refreshToken you need to store in your database. Even the refreshToken is valid for 101 days, however, it CAN BE CHANGED when you make the refreshtoken API call. Once it is changed, the previous refreshToken will no longer be valid. Potentially causing a request being blocked by QBO,

 

2) When is the new access token requested? Each time the app makes a call to QBO?

Not each time the app makes a call to QBO, but each time the user STARTS to use the app. Based on our research, most users won't use an app for more than one hour. Therefore, we design our access token to be valid for one hour. However, if the user does use the app for a longer time, you will need to update the access token again.

 

3) What happens when the token expires after one year? Does it return a 401 error back to the app per the documentation?

As I have mentioned, the Access token is only valid for one hour and the refresh token is valid for 101 days. When the access token expired, QBO will return a "401 unauthorized" message back to the app as documented.

 

4) Why my refresh Token seems like is only valid for "24 hours", not 101 days?

Each day(every 24 hours), QuickBooks Online will return a new Refresh Token for every Refresh Token API call. As I mentioned, if a new refresh token is returned, the previous one will be forced to expire. For example, On day 1, developer makes a refresh token API call using refresh token A, it returned access token C, refresh Token A. On day 2, developer makes a refresh token API call using refresh token A, it will return access token X, refresh Token Z. That is, on day 2, a new refresh token is returned, and the refresh token A is forced to expire. For simplicity, we tell our developers always store the LATEST refresh token returned from QBO. In this sense, you do not need to worry about 24 hours or 101 days.

 

When you request a new access token, you also get a new refresh token. You should be using this new refresh token to get any future access token. The previous refresh token is expired. Therefore, developers are required to always store the latest refresh_token returned from Access Token API call, and use the latest refresh_token to make Access Token API Call. In this case, you will never get an invalid_grant error.

 

You should store the access and refresh tokens in the site's database encrypted. When you go to make a connection to QBO, the access token is pulled, decrypted and tested. If it returns invalid grant, the refresh token is pulled from the DB, decrypted and used to get new access AND refresh tokens. Those are then stored encrypted in the database and the new access token used. The key here is to reset BOTH the access AND the refresh tokens every time you need to refresh.

 

1. Test access token

2. If access token fails, use current refresh token to request new tokens

3. Store returned tokens, BOTH new access AND new refresh

4. Use new access token to connect

5. When access token fails in an hour, go to step 2.

 

https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0#understand-token-expiration