"use strict";

// dependencies
var async = require("async");
var AWS = require("aws-sdk");
var util = require("util");
var fs = require("fs"),
  PNG = require("pngjs").PNG,
  pixelmatch = require("pixelmatch");

// get reference to S3 client
var s3 = new AWS.S3();
var s3ImageUtil = require("s3imageutil");

/**
 * If baseline exists for incoming image, compare against it. Otherwise, do nothing.
 * 
 * @param {*} event 
 * @param {*} context 
 * @param {*} callback 
 */
module.exports.compare = function(event, context, callback) {
  // Read options from the event.
  console.log(
    "Reading options from event:\n",
    util.inspect(event, { depth: 5 })
  );

  // Unique image for the specific screenshot under review
  // For example, google_homepage_screenshot-2017-12-13-T09-55-52-cjb5cx6290000f6g2z11fipqj.png
  var imageKey = event.Records[0].s3.object.key;
  console.log("imageKey is: " + imageKey);
  // Associated view which may have many images representing it (from different runs, branches, dvelopers, etc)
  // For example, google_homepage_screenshot.png
  var viewKey = s3ImageUtil.get_view_from_key(imageKey);
  console.log("viewKey is: " + viewKey);
  
  // image baseline s3 bucket
  var baselineSrcBucket = "baseline-bloom-image-bucket";
  // new image s3 bucket
  var newSrcBucket = "new-bloom-image-bucket";
  // image delta destination s3 bucket
  var deltaDstBucket = "delta-bloom-image-bucket";

  async.waterfall(
    // Download the baseline and new images from S3, compare, and upload the delta to destination S3 bucket
    [
      function downloadBaseline(next) {
        // Download the baseline image from S3
        s3.getObject(
          {
            Bucket: baselineSrcBucket,
            Key: viewKey
          },
          function(err, baseline) {
            debugger;
            if (err) {
              if (err.code == "NoSuchKey") {
                // No baseline defined, no further processing needed
                console.log("No further processing needes as there is no baseline image found for: " + viewKey);
                return;
              } else {
                console.log(err, err.stack);
              }
            } else next(null, baseline);
          }
        );
      },
      // PERFORMANCE TODO: Run this and the above in parallel
      function downloadNew(baseline, next) {
        // Download the new image from S3
        s3.getObject(
          {
            Bucket: newSrcBucket,
            Key: imageKey
          },
          function(err, newImage) {
            if (err) {
              console.log("Problem downloading image under review: "  + imageKey);
              console.log(err, err.stack);
              return;
            } else {
              next(null, baseline, newImage);
            }
          }
        );
      },

      // PERFORMANCE TODO: Avoid writing to disc, transfer image delta data in memory
      function compare(baseline, newImage, next) {
        // Compare baseline and newImage, write delta image to disc
        var baselinePNG = PNG.sync.read(baseline.Body);
        var newImagePNG = PNG.sync.read(newImage.Body);
        var diff = new PNG({
          width: baselinePNG.width,
          height: baselinePNG.height
        });
        pixelmatch(
          baselinePNG.data,
          newImagePNG.data,
          diff.data,
          baselinePNG.width,
          baselinePNG.height,
          { threshold: 0.1 }
        );
        diff
          .pack()
          .pipe(fs.createWriteStream("/tmp/" + imageKey))
          .on("finish", () => {
            next();
          });
      },
      //function upload(contentType, data, next) {
      function upload(next) {
        const fileBuffer = fs.readFileSync("/tmp/" + imageKey);
        // Stream the transformed image to a different S3 bucket.
        s3.putObject(
          {
            Bucket: deltaDstBucket,
            Key: imageKey,
            Body: fileBuffer,
            ContentType: "image/png",
            ACL: 'public-read'
          },
          next
        );
      }
    ],
    function(err) {
      if (err) {
        console.error(
          "Unable to compare new image " +
            baselineSrcBucket +
            "/" +
            imageKey +
            " and upload to " +
            deltaDstBucket +
            "/" +
            imageKey +
            " due to an error: " +
            err
        );
      } else {
        console.log(
          "Successfully compared baseline and new " +
            baselineSrcBucket +
            "/" +
            imageKey +
            " and uploaded to " +
            deltaDstBucket +
            "/" +
            imageKey
        );
      }

      callback(null, "message");
    }
  );
};
