const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.go("/administrator/index.php?option=com_installer&view=install");
        await browser.click("#myTabTabs li:nth-child(3) a");
        await browser.setValue("#install_url", options.args[0]);

        await joomla.clickWaitShowMsg("#installbutton_url");
    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
