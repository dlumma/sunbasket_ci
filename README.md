# bloomcode
Near instant CI from bloomcode;  blazing fast, highly parallelized browser control and application verification

# Setup and Usage

Edit .bash_profile_bloomcode_local with appropriate values

```
cp .bash_profile_bloomcode .bash_profile_bloomcode_local
```
Source the file

```
source .bash_profile_bloomcode_local
```

This project will work both locally and remotely. 
Direct the run to be either remote or local with:

```
export REMOTE=true
export REMOTE=false
```

Install depdendencies
```
npm install
```

To execute everything at once
```
npm run all 
```

To execite substeps
```
npm run build
npm run setup-run
npm run bloom-test
npm run format-results
npm run review-results
```

Unit tests
```
npx ava src/management/test-management-util.js
```

To change which tests run, modify SCENARIOS
```
SCENARIOS=/Users/denali/work/bloomcode/sunbasket/lib/scenarios.js
export SCENARIOS=/Users/denali/work/bloomcode/sunbasket/lib/scenarios.js\ --match='sunbasket_schedule_upcoming*'
```

# Areas of Responsibility

## Test Orchestration

Defined from package.json:

* Create a time specific run identifier
* Leverage ava to execute the tests in parallel 
* Record the results
* Format the results

## Browser Management

Defined from src/browser_management:

* Controls the headless chrome instances 
* Can be run locally or remotely in aws lambda

## User Review

Defined from src/results_management:

* Provide a command line utility for test results review and management

## Visual Checker

An in-house visual comparison lambda function can process screenshots
and make them available for comparison for a given run.

* src/visual_checker

## Examples

Defined from src/examples:

* pages.js (Encapsulate the page selectors and functionality in one place)
* personas.js (Encapsulate the test subject(s) information in one place)
* scenarios.js (Define all application under test states here, with setup and teardown ava functions leveraged for DRY principle)

# Code organization

* This project uses babel in order to allow for async/await syntax to be used in code that will execute on lambda (and thus run in node 6.10) via down-compiled code represented with promises. Original source code is defined in  `src` and babel-compiled code is defined in `lib`.
