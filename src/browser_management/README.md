# service
This is the aws lambda service definition supporting bloomcode core which enables execution and control of headless chrome in aws lambda.

## Overview
This package contains the libraries to be deployed to aws lambda (dependencies), and the supporting libraries to bundle/ package, test, and deploy to aws lambda leveraging the serverless framework (in dev mode only).

The serverless service is called: 
```
chromeless-serverless
```

There are four functions defined:
```
-disconnect
-run
-version
-session
```

Main depedencies are:
```
    "aws4": "^1.6.0",
    "chromeless": "^1.2.0",
    "cuid": "^1.3.8",
    "mqtt": "^2.11.0",
    "source-map-support": "^0.4.15"
```


## Setup

In order to make changes, set up your development env with the following steps.

Confirm:
- an aws account has been created
- aserverless account account has been created: https://serverless.com/framework/docs/providers/aws/guide/credentials/
- set local environment variables:

```
export AWS_ACCESS_KEY_ID=[TO SET]
export AWS_SECRET_ACCESS_KEY=[TO SET]
export AWS_IOT_HOST=[TO SET].iot.us-east-1.amazonaws.com
```

Then run:

```
npm install
npm run deploy
```

Once completed, some service information will be logged. Make note of the session GET endpoint and the value of the dev-chromeless-session-key API key. You'll need them when using Chromeless through the Proxy from bloomcode/core.


```
export CHROMELESS_ENDPOINT_URL=[TO SET.execute-api.us-east-1.amazonaws.com/dev/
export CHROMELESS_ENDPOINT_API_KEY=[TO SET]
```