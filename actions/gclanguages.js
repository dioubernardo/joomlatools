const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.goAndClickClear("/administrator/index.php?option=com_languages&view=languages");

        await joomla.changeWait("#list_limit", "0");
        await joomla.changeWait("#filter_published", "0");

        let list = await joomla.getLines(
            "#j-main-container > table",
            [0]
        );
        if (list.length > 0) {
            await joomla.checkAll();
            await joomla.clickWaitShowMsg("#toolbar-trash button")
        }

        await joomla.changeWait("#filter_published", "-2");

        list = await joomla.getLines(
            "#j-main-container > table",
            [0]
        );
        if (list.length > 0) {
            await joomla.checkAll();

            await joomla.clickWaitShowMsg("#toolbar-delete button");
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
