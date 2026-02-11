const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.go("/administrator/index.php?option=com_plugins");

        await browser.click("button.js-stools-btn-clear");
        await browser.waitLoad();

        await browser.setValue("#filter_search", options.args[0]);

        await browser.click("button:has(.icon-search)");
        await browser.waitLoad();

        let list = await joomla.getLines(
            "#j-main-container > table",
            [3, 7]
        );

        if (list.length > 0) {

            for (let i = 0; i < list.length; i++) {
                const item = list[i][0];
                const id = list[i][1];

                if (item == options.args[0]) {
                    await browser.click("[name='cid[]'][value=" + id + "]");
                    await browser.click("#toolbar-unpublish button");
                    await browser.waitLoad();

                    const msg = await browser.getText("#system-message-container .alert-message");
                    console.log(" " + msg);
                    break;
                }
            }
        }else{
            console.log(" Not found " + options.args[0]);
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
