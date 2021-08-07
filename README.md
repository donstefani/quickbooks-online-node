# quickbooks-sync

NOTE: With Quickbooks online (QBO) and serverless apps the challange is OAuth2. 

You can read about it here: [OAuth2 and Serverless Notes](docs/OAuthServerlessNotes.md)

There are two main Lambda functions:

* [__refreshAouthToken.js__](#refreshAouthToken) 
* [__quickbooksSyncCron.js__](#quickbooks-sync)

***
#### __refreshAouthToken__

The purpose of this function is to insure that the `access_token` and the `refresh_token` from QBO is always current. 

It updates the `qb_auth_token` table every 45 minutes, with a fresh authorization and refresh token.

It does this for each QBO account, currently `Fiftflowers` and `Flowerfix`. Each account needs it's own OAuth tokens.
***
#### __quickbooksSyncCron__
