"use strict";

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _exports = module.exports = {};
var AWS = require("aws-sdk");
var s3 = new AWS.S3();

/**
 * Parse the image url in s3 from the TAP raw comment output.
 * 
 * For example,
 * This text: 
 * "   * google_homepage_screenshot-2017-12-06-T14:17:13 screenshot location: https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png"
 * Becomes: 
 * "https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png"
 *
 * @param {*} raw_comment 
 */
_exports.get_image_url_from_comment = function (raw_comment) {
  var searchStr = " screenshot location: ";
  var i = raw_comment.indexOf(searchStr);
  return raw_comment.slice(i + searchStr.length, raw_comment.length);
};

/**
 * Parse the s3 image key from the s3 url.
 * 
 * For example,
 * This text:
 * "https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png"
 * Becomes:
 * "google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png"   
 * 
 * @param {*} url 
 */
_exports.get_image_key_from_url = function (url) {
  var searchStr = "s3.amazonaws.com/";
  var i = url.indexOf(searchStr);
  return url.slice(i + searchStr.length, url.length);
};

/**
 * Parse the view from the s3 url. The view is the unqiue string to identify this view, without any concern for the
 * particular run in which is was taken. Examples of views are: google_homepage_screenshot.png or People.png
 * 
 * For example,
 * This text:
 * "https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png"
 * Becomes:
 * "google_homepage_screenshot.png"
 * 
 * @param {*} url 
 */
_exports.get_view_from_url = function (url) {
  var searchStr = "s3.amazonaws.com/";
  var i = url.indexOf(searchStr);
  var endUrl = url.slice(i + searchStr.length, url.length);
  var searchStr2 = "-";
  var j = endUrl.indexOf(searchStr2);
  return endUrl.slice(0, j) + ".png";
};

/**
 * Parse the view from the key (which may include more specific run information such as a timestamp).
 * 
 * For example;
 * This text:
 * "google_homepage_screenshot-2017-12-12-T15%3A58%3A41-cjb4afw6t00008zg22pnsjjw9.png"
 * Becomes:
 * "google_homepage_screenshot.png"
 * 
 * @param {*} key 
 */
_exports.get_view_from_key = function (key) {
  var searchStr = "-";
  var j = key.indexOf(searchStr);
  return key.slice(0, j) + ".png";
};

/**
 * Via async/ await, return boolean true or false indicating if the image exists in s3.
 */
_exports.image_exists = (() => {
  var _ref = _asyncToGenerator(function* (key, bucket) {
    var params = { Bucket: bucket, Key: key };
    try {
      yield s3.headObject(params).promise();
      return true;
    } catch (error) {
      return false;
    }
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Given a key and a bucket, return the s3 url.
 * 
 * @param {*} key 
 * @param {*} bucket 
 */
_exports.get_image_url = function (key, bucket) {
  return "https://" + bucket + ".s3.amazonaws.com/" + key;
};

/**
 * Copy the image from the source to the destination. 
 * 
 * @param {*} srcKey 
 * @param {*} srcBucket 
 * @param {*} dstKey 
 * @param {*} dstBucket 
 */
_exports.copy_image = (() => {
  var _ref2 = _asyncToGenerator(function* (srcKey, srcBucket, dstKey, dstBucket) {
    var params = {
      Bucket: dstBucket,
      CopySource: srcBucket + "/" + srcKey,
      Key: dstKey
    };
    try {
      yield s3.copyObject(params).promise();
      return true;
    } catch (error) {
      return false;
    }
  });

  return function (_x3, _x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Via async/ await, delete the object in s3. Return true is the operation is successful,
 * return false if not.
 * 
 * @param {*} key 
 * @param {*} bucket 
 */
_exports.delete_image = (() => {
  var _ref3 = _asyncToGenerator(function* (key, bucket) {
    var params = {
      Bucket: bucket,
      Key: key,
      VersionId: null
    };
    try {
      yield s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      return false;
    }
  });

  return function (_x7, _x8) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Move the image from the source to the destination. 
 * First copy the object over, if that succeeds, then delete it from the original location.
 * 
 * @param {*} srcKey 
 * @param {*} srcBucket 
 * @param {*} dstKey 
 * @param {*} dstBucket 
 */
_exports.move_image = (() => {
  var _ref4 = _asyncToGenerator(function* (srcKey, srcBucket, dstKey, dstBucket) {
    var params = {
      Bucket: dstBucket,
      CopySource: srcBucket + "/" + srcKey,
      Key: dstKey
    };
    // copy original to new
    try {
      const copy_success = yield _exports.copy_image(srcKey, srcBucket, dstKey, dstBucket);
      // delete the original
      console.log("Copy was successful, attempting to delete the original image file");
      try {
        yield _exports.delete_image(srcKey, srcBucket);
        return true;
      } catch (error) {
        console.log("Delete unsuccessful");
        return false;
      }
    } catch (error) {
      console.log("Copy failed, aborting process (will not delete image)");
      return false;
    }
  });

  return function (_x9, _x10, _x11, _x12) {
    return _ref4.apply(this, arguments);
  };
})();

/**
 * Prompt the user to set baseline as the given image.
 */
_exports.get_prompt = function (message) {
  var questions = [{
    type: "list",
    name: "action",
    message: message,
    choices: ["Accept as Baseline", "Reject as Bug (Delete)", "Continue (Do Nothing)"],
    filter: function (val) {
      return val.toLowerCase();
    }
  }];
  return questions;
};