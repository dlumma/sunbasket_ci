import test from "ava";
var s3ImageUtil = require("./s3imageutil.js");
var cuid = require('cuid');

test("Test get_image_url_from_comment",  t => {
    var sample_comment = "   * google_homepage_screenshot-2017-12-06-T14:17:13 screenshot location: https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png";
    var output = s3ImageUtil.get_image_url_from_comment(sample_comment);
    t.is(output, "https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png");
});

test("Test get_image_key_from_url", t => {
    var sample_url = "https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png";
    var output = s3ImageUtil.get_image_key_from_url(sample_url);
    t.is(output, "google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png")    
})

test("Test get_view_from_url", t => {
    var sample_url = "https://new-bloom-image-bucket.s3.amazonaws.com/google_homepage_screenshot-2017-12-06-T14:17:13-cjavm6b5c00005fg2b29tuyfh.png";
    var output = s3ImageUtil.get_view_from_url(sample_url);
    t.is(output, "google_homepage_screenshot.png")
});

test("Test get_view_from_key", t=> {
    var sample_specific_filename = "google_homepage_screenshot-2017-12-12-T15%3A58%3A41-cjb4afw6t00008zg22pnsjjw9.png";
    var output = s3ImageUtil.get_view_from_key(sample_specific_filename);
    t.is(output, "google_homepage_screenshot.png");
});

test("Test image_exists with a valid image returns true",  async t =>{
    const does_it_exists = await s3ImageUtil.image_exists("google_homepage_screenshot.png", "baseline-bloom-image-bucket");
    t.is(does_it_exists, true);
});

test("Test image_exists with a invalid image returns false",  async t =>{
    const does_it_exists = await s3ImageUtil.image_exists("DoesNotExist.png", "baseline-bloom-image-bucket");
    t.is(does_it_exists, false);
});

test("Test get_image_url returns correctly formatted string", t =>{
    var output = s3ImageUtil.get_image_url("People.png", "new-bloom-image-bucket");
    t.is(output, "https://new-bloom-image-bucket.s3.amazonaws.com/People.png");
});

test("Test copy_image is successful", async t=>{
    // copy an image
    var temp_file = cuid();
    console.log("copy_image temp_file is: " + temp_file);
    try {
        await s3ImageUtil.copy_image("People.png", "baseline-bloom-image-bucket", temp_file, "new-bloom-image-bucket"); 
        // assert new image is there
        const does_image_exist = await s3ImageUtil.image_exists(temp_file,  "new-bloom-image-bucket");
        t.is(does_image_exist, true);
        // cleanup, remove temp_file
        const success_on_delete = await s3ImageUtil.delete_image(temp_file, "new-bloom-image-bucket");
    } catch (error) {
        t.fail();
    }
});

test("Test delete_image is successful", async t=>{
    var temp_file = cuid();
    console.log("delete_image temp_file is: " + temp_file);
    try {
        await s3ImageUtil.copy_image("People.png", "baseline-bloom-image-bucket", temp_file, "new-bloom-image-bucket"); 
    } catch (error) {
        t.fail();
    }
    console.log("Copy was successful, attempting delete");
    const success_on_delete = await s3ImageUtil.delete_image(temp_file, "new-bloom-image-bucket");
    t.is(success_on_delete, true);
    // assert file doesn't exist after delete
    const does_image_exist = await s3ImageUtil.image_exists(temp_file,  "new-bloom-image-bucket");
    t.is(does_image_exist, false);
});

test("Test move_object moves an object to the new destination and deletes the original", async t => {
    var temp_file = cuid();
    console.log("move_file temp_file is: " + temp_file);
    // Create test image to move (and destroy in the process)
    try {
        await s3ImageUtil.copy_image("People.png", "baseline-bloom-image-bucket", temp_file, "new-bloom-image-bucket"); 
    } catch (error) {
        t.fail();
    }
    console.log("Copy was successful, attempting move");
    try {
        await s3ImageUtil.move_image(temp_file, "new-bloom-image-bucket", temp_file, "delta-bloom-image-bucket"); 
    } catch (error) {
        console.log(error);
        t.fail();
    }
    try{
        // assert that original DOES NOT exist
        const old_file_exists = await s3ImageUtil.image_exists(temp_file, "new-bloom-image-bucket");
        t.is(old_file_exists, false);
        // assert that new file DOES exist
        const new_file_exists = await s3ImageUtil.image_exists(temp_file, "delta-bloom-image-bucket");
        t.is(new_file_exists, true);
        // Now clean up
        await s3ImageUtil.delete_image(temp_file, "delta-bloom-image-bucket");
    } catch (error) {
        t.fail();
    }
});