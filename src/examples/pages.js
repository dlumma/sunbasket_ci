const buildUrl = require('build-url');

function external_landing_page()
{
    var obj = {}; 
    obj.href = process.env.AUT_DOMAIN;
    return obj;
}

function login_page()
{
    var obj = {};
    obj.href = buildUrl(process.env.AUT_DOMAIN, {path: 'login'});
    obj.email_input_selector = '#email';
    obj.password_input_selector = '#password';
    obj.submit_button_selector = '#login-container > div > div > div > div > form > fieldset > button';

    obj.authenticate = async function(chromeless, email, password){
        await chromeless.goto(this.href)
        .type(email, this.email_input_selector)
        .type(password, this.password_input_selector)
        .click(this.submit_button_selector)
        .wait(internal_landing_page().settings_dropdown);
    }
    return obj;
}

module.exports = {
    external_landing_page: external_landing_page(),
    login_page: login_page()
}