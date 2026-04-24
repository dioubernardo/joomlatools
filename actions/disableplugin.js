const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.goAndClickClear("/administrator/index.php?option=com_plugins");

        await joomla.searchWait(options.args[0]);

        let list = await joomla.getContent([3, 7]);
        for (let i = 0; i < list.length; i++) {
            const item = list[i][0];
            const id = list[i][1];

            if (item == options.args[0]) {
                await browser.click("[name='cid[]'][value=" + id + "]");
                await joomla.clickWaitShowMsg("#toolbar-unpublish button");
                await log.write(`Plugin ${item} desabilitado`);
                break;
            }
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
