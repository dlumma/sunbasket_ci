"use strict";

var _ava = require("ava");

var _ava2 = _interopRequireDefault(_ava);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var s3ImageUtil = require("./s3imageutil.js");
var cuid = require('cuid');

(0, _ava2.default)("Test get_image_url_from_comment", t => {
    var sample_comment = "   * google_homepage_screenshot-2017-12-06-T14:17:13 screenshot location: https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png";
    var output = s3ImageUtil.get_image_url_from_comment(sample_comment);
    t.is(output, "https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png");
});

(0, _ava2.default)("Test get_image_key_from_url", t => {
    var sample_url = "https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png";
    var output = s3ImageUtil.get_image_key_from_url(sample_url);
    t.is(output, "google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png");
});

(0, _ava2.default)("Test get_view_from_url", t => {
    var sample_url = "https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png";
    var output = s3ImageUtil.get_view_from_url(sample_url);
    t.is(output, "google_homepage_screenshot.png");
});

(0, _ava2.default)("Test get_view_from_key", t => {
    var sample_specific_filename = "google_homepage_screenshot-2017-12-12-T15%3A58%3A41-cjb4afw6t00008zg22pnsjjw9.png";
    var output = s3ImageUtil.get_view_from_key(sample_specific_filename);
    t.is(output, "google_homepage_screenshot.png");
});

(0, _ava2.default)("Test image_exists with a valid image returns true", (() => {
    var _ref = _asyncToGenerator(function* (t) {
        const does_it_exists = yield s3ImageUtil.image_exists("google_homepage_screenshot.png", "baseline-bloom-image-bucket");
        t.is(does_it_exists, true);
    });

    return function (_x) {
        return _ref.apply(this, arguments);
    };
})());

(0, _ava2.default)("Test image_exists with a invalid image returns false", (() => {
    var _ref2 = _asyncToGenerator(function* (t) {
        const does_it_exists = yield s3ImageUtil.image_exists("DoesNotExist.png", "baseline-bloom-image-bucket");
        t.is(does_it_exists, false);
    });

    return function (_x2) {
        return _ref2.apply(this, arguments);
    };
})());

(0, _ava2.default)("Test get_image_url returns correctly formatted string", t => {
    var output = s3ImageUtil.get_image_url("People.png", "new-bloom-image-bucket");
    t.is(output, "https://new-bloom-image-bucket.s3.amazonaws.com/People.png");
});

(0, _ava2.default)("Test copy_image is successful", (() => {
    var _ref3 = _asyncToGenerator(function* (t) {
        // copy an image
        var temp_file = cuid();
        console.log("copy_image temp_file is: " + temp_file);
        try {
            yield s3ImageUtil.copy_image("People.png", "baseline-bloom-image-bucket", temp_file, "new-bloom-image-bucket");
            // assert new image is there
            const does_image_exist = yield s3ImageUtil.image_exists(temp_file, "new-bloom-image-bucket");
            t.is(does_image_exist, true);
            // cleanup, remove temp_file
            const success_on_delete = yield s3ImageUtil.delete_image(temp_file, "new-bloom-image-bucket");
        } catch (error) {
            t.fail();
        }
    });

    return function (_x3) {
        return _ref3.apply(this, arguments);
    };
})());

(0, _ava2.default)("Test delete_image is successful", (() => {
    var _ref4 = _asyncToGenerator(function* (t) {
        var temp_file = cuid();
        console.log("delete_image temp_file is: " + temp_file);
        try {
            yield s3ImageUtil.copy_image("People.png", "baseline-bloom-image-bucket", temp_file, "new-bloom-image-bucket");
        } catch (error) {
            t.fail();
        }
        console.log("Copy was successful, attempting delete");
        const success_on_delete = yield s3ImageUtil.delete_image(temp_file, "new-bloom-image-bucket");
        t.is(success_on_delete, true);
        // assert file doesn't exist after delete
        const does_image_exist = yield s3ImageUtil.image_exists(temp_file, "new-bloom-image-bucket");
        t.is(does_image_exist, false);
    });

    return function (_x4) {
        return _ref4.apply(this, arguments);
    };
})());

(0, _ava2.default)("Test move_object moves an object to the new destination and deletes the original", (() => {
    var _ref5 = _asyncToGenerator(function* (t) {
        var temp_file = cuid();
        console.log("move_file temp_file is: " + temp_file);
        // Create test image to move (and destroy in the process)
        try {
            yield s3ImageUtil.copy_image("People.png", "baseline-bloom-image-bucket", temp_file, "new-bloom-image-bucket");
        } catch (error) {
            t.fail();
        }
        console.log("Copy was successful, attempting move");
        try {
            yield s3ImageUtil.move_image(temp_file, "new-bloom-image-bucket", temp_file, "delta-bloom-image-bucket");
        } catch (error) {
            console.log(error);
            t.fail();
        }
        try {
            // assert that original DOES NOT exist
            const old_file_exists = yield s3ImageUtil.image_exists(temp_file, "new-bloom-image-bucket");
            t.is(old_file_exists, false);
            // assert that new file DOES exist
            const new_file_exists = yield s3ImageUtil.image_exists(temp_file, "delta-bloom-image-bucket");
            t.is(new_file_exists, true);
            // Now clean up
            yield s3ImageUtil.delete_image(temp_file, "delta-bloom-image-bucket");
        } catch (error) {
            t.fail();
        }
    });

    return function (_x5) {
        return _ref5.apply(this, arguments);
    };
})());