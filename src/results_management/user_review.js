const openurl = require("openurl");
var inquirer = require("inquirer");
var ArgumentParser = require("argparse").ArgumentParser;
var fs = require("fs");
var AWS = require("aws-sdk");
var s3 = new AWS.S3();
var s3ImageUtil = require("s3imageutil");
var async = require("async");

// parse results file for review
var parser = new ArgumentParser({
  version: "0.0.1",
  addHelp: true,
  description: "Argparse example"
});
parser.addArgument(["-r", "--results"], {
  help: "Review and take action on test results"
});
var args = parser.parseArgs();

var runResults = JSON.parse(fs.readFileSync(args.results));

// image baseline s3 bucket
var baselineSrcBucket = "baseline-bloom-image-bucket";
// new image s3 bucket
var newSrcBucket = "new-bloom-image-bucket";
// image delta destination s3 bucket
var deltaSrcBucket = "delta-bloom-image-bucket";

/**
 * Prompt the user for actions to take with a specific image under review.
 */
function get_prompt(index, message) {
  var prompt = {
    type: "list",
    name: index,
    message: message,
    choices: [
      "Accept as Baseline",
      "Reject as Bug and Delete",
      "Continue and Do Nothing"
    ],
    filter: function(val) {
      return val.toLowerCase();
    }
  };
  return prompt;
}

/**
 * Build the prompt (set as baseline or resolve diff) based on the state of the new image.
 *
 * @param {*} iKeyUrl
 * @param {*} vKey
 * @param {*} iKey
 */
async function get_question(iKeyUrl, vKey, iKey) {
  const does_baseline_exist = await s3ImageUtil.image_exists(
    vKey,
    baselineSrcBucket
  );
  //console.log("does_baseline_exist: " + does_baseline_exist);
  if (!does_baseline_exist) {
    return "\nFor user view: " +
      vKey + 
      "\n" + 
      iKeyUrl + 
      "\nthere is no BASELINE, set this as the BASELINE?";
  }
  const does_delta_exist = await s3ImageUtil.image_exists(iKey, deltaSrcBucket);
  //console.log("does_delta_exist: " + does_delta_exist);
  if (does_delta_exist) {
    // delta exists, prompt user on what to do
    //openurl.open(s3ImageUtil.get_image_url(iKey, deltaSrcBucket));

    return "\nFor user view: " + 
      vKey + 
      "\n" + 
      iKeyUrl + 
      "\nthere are CHANGES detected, should these be accepted as the baseline?";
  }
  console.log("nothing to do, no baseline needed and no delta exists")
}

/**
 * Build the collection of prompts for all images.
 */
async function build_prompts() {
  // Get list of all tests
  var testResults = runResults.tests;
  var prompts = [];
  // For each test, check for existance of:
  // --baseline
  // --delta
  for (var index in testResults) {

    var val = testResults[index];
    // The s3 image key url
    var imageKeyUrl = s3ImageUtil.get_image_url_from_comment(
      runResults.comments[index].raw
    );

    // The unique key for the screenshot under review
    var iKey = s3ImageUtil.get_image_key_from_url(imageKeyUrl);

    // The generic key for the view associated with this screenshot
    var vKey = s3ImageUtil.get_view_from_url(imageKeyUrl);

    // build the question array
    prompts.push(
      get_prompt(index.toString(), await get_question(imageKeyUrl, vKey, iKey))
    );
  }
  return prompts;
}

/**
 * Once answers have been collected, take action.
 */
async function process_answers(questions) {
  inquirer.prompt(questions).then(answers => {
    console.log(JSON.stringify(answers, null, "  "));

    for (var index in answers) {
      var a = answers[index];
      console.log("answer is: " + a.toString());
      // accept as baseline
      if (a === "accept as baseline") {
        console.log("ANSWER IS BEING MOVED TO BASELINE");
        // set as baseline
        s3ImageUtil.move_image(iKey, newSrcBucket, vKey, baselineSrcBucket);
      }
      // reject as bug and delete
      if (a === "reject as bug and delete") {
        const delete_successful = s3ImageUtil.delete_image(iKey, newSrcBucket);
        if (delete_successful) console.log("Deletion of new image successful");
      }
    }
  });

}

async function run_all() {
  const questions = await build_prompts();
  //console.log("questions are:  " + JSON.stringify(questions, null, "  "));
  await process_answers(questions);
}

run_all();
