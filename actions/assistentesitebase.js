const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.go("/administrator/index.php?option=com_assistente&task=siteBase");

        const selectormsg = "#system-message-container .alert-message";
        if (await browser.hasObject(selectormsg)) {
            const msg = await browser.getText(selectormsg);
            console.log(msg);
       }
    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
