# Visual Comparison

This is a visual comparison service (currently running on lambda via serverless with s3 peristence) for [bloomcode](https://github.com/bloomcode).

## Key Features

* Run image comparsion in a highly parallelized, concurrent way (infinite concurrency)
* Works in tandem with bloomcode code infinitely parallelized browser control
* Emphasis on speed 


## How it Works


Baseline images, new images and delta images are stored in their own respective buckets in s3.
All related images (images taken from the same logical view) are stored with the same file key but in different buckets, such that we have:

```
baseline-bloom-image-bucket/People.png
new-bloom-image-bucket/People.png
delta-bloom-image-bucket/People.png
```

All the the People.png files relate to the same "view" in different states (the baseline state, the new state and the delta between baseline and new).

## Tools and Technologies

This service leverages:

* Serverless
* AWS Lambda
* s3
* pixeldiff

## Developer Setup

To contribute, setup your local env to work with serverless: https://serverless.com/

To build:
```
npm install
```

To deploy: 
```serverless deploy -v```

To run with an example event: 
```serverless invoke local -f compare -l --path ./s3Input.txt```

To run with an example event with no baseline previously saved: 
```serverless invoke local -f compare -l --path ./noBaselineInput.txt```