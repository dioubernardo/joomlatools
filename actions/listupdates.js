const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.go("/administrator/index.php?option=com_installer&view=updatesites");
        await joomla.clickWaitShowMsg("#toolbar-refresh button");

        await joomla.go("/administrator/index.php?option=com_installer&view=update");
        await joomla.clickWaitShowMsg("#toolbar-purge button");
        await joomla.clickWaitShowMsg("#toolbar-refresh button");

        await joomla.changeWait("#list_limit", 0);

        let list = await joomla.getContent([1, 4, 5]);

        if (list.length > 0) {
            list.forEach(update => {
                console.log(" " + update[0] + " from " + update[1] + " to " + update[2]);
            });
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
