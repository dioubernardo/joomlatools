const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.go("/administrator/index.php?option=com_finder");

        await browser.confirm(true);
        await browser.click("button.button-trash");
        await browser.waitLoad();

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
