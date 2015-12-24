# Overview

This is a Node.js REST API proxy for [SparkPost](https://www.sparkpost.com/) that implements A/B testing.  The usual workflow looks like this:

1. Client sends a group of weighted transmission requests (A, B, C, ...) to proxy
2. Proxy selects a transmission request X using the given weights
3. Proxy sends transmission request X to SparkPost

The proxy supports overriding of any field in the request and automatically mangles the 'campaign_id' field to indicate that an A/B test is in progress.

The proxy will also allow non-A/B Transmission requests to pass through transparently for easy addition and removal of A/B testing capability.

# Usage

Install the package:

  `npm install https://github.com/ewandennis/sp-ab-split-proxy`

Configure the proxy:

Edit config/production.json, set targetEndpoint to your SparkPost or SparkPost Elite API endpoint and set proxyPort to the port your proxy should listen on.

```
  {
    "targetEndpoint": "https://api.sparkpost.com/",
    "proxyPort": 3000
  }
```

Start the proxy:

  `npm start prod`

Send SparkPost Transmission requests to your proxy with an added "subrequests" key in the payload to control A/B testing:

```
  POST /api/v1/transmissions
  {
    // Transmission request fields common to all 'sub-requests'
    recipients: {
      // ...
    },
    content: {
      // ...
    }

    // Experiments: fields to be overlaid onto the request
    "subrequests": [
      {
        "weight": 0.5,
        "req": {
          "content": {
            "subject": "Subject Line Number One"
          }
        }
      },
      {
        "weight": 0.5,
        "req": {
          "content": {
            "subject": "Subject Line No. 2"
          }
        }
      }
    ]
  }
```

Watch as each proxied transmission request results in a SparkPost API call with either "Subject Line Number One" or "Subject Line No. 2".
