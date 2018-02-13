import test from "ava";
import {Chromeless} from "chromeless";
const pages = require('./pages.js');
const personas = require('./personas.js');


/**
 * Process the browser's state with any and all checkers which are
 * registered with the system.
 * 
 * @param {Object} chromeless - the active browser
 */
async function checkpoint(t) {

    var log_list = [];

    // Screenshot testing is turned on by default
    // All possible verification types can be managed by env vars later on.
    const SCREENSHOT_CHECKER = true;
    const SECURITY_CHECKER = false;
    const PERFORMANCE_CHECKER = false;
    const ACCESSIBILITY_CHECKER = false;
    const LOCALIZATION_CHECKER = false;

    if (SCREENSHOT_CHECKER){
        const screenshot = await t.context.chromeless.screenshot(null, { s3ObjectKeyPrefixOverride: t.title + "-" });
        log_list.push(" screenshot location: " + screenshot);
    }
    if (SECURITY_CHECKER){}
    if (PERFORMANCE_CHECKER){}
    if (ACCESSIBILITY_CHECKER){}
    if (LOCALIZATION_CHECKER){} 
    
    return log_list;
};

/**
 * Prepare a unique browser instance for each test in the correct setting, either local or remote.
 */
test.beforeEach(t => {
    var flag = "" + process.env.REMOTE === "true";
    const chromeless = new Chromeless({
      remote: flag
    });
    t.context.chromeless = chromeless;
});

/**
 * Close the chromeless instance after each test regardless of test outcome.
 */
test.afterEach.always(t => {
    t.context.chromeless.end();
});


/**
 * Test the external landing page.
 */
test("external_landing", async t => {

    await t.context.chromeless.goto(pages.external_landing_page.href);
    (await checkpoint(t)).forEach(function(element){t.log(element);})

    t.pass();

});

/**
 * Test internal landing page (after customer has authenticated).
 */
test("internal_landing", async t => {

    await pages.login_page.authenticate(t.context.chromeless, personas.persona_a.email, personas.persona_a.password);
    (await checkpoint(t)).forEach(function(element){t.log(element);})

    t.pass();

});