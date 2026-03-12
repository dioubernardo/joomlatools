const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        // desbloqueando conteudo
        await joomla.go("/administrator/index.php?option=com_checkin");
        let list = await joomla.getLines(
            "#j-main-container > table",
            [1]
        );
        if (list.length > 0) {
            await joomla.checkAll();
            await browser.click("button.button-checkin");
            await browser.waitLoad();

            const msg = await browser.getText("#system-message-container .alert-message");
            console.log(" " + msg);
        }

        // limpando modulos inuteis
        await joomla.go("/administrator/index.php?option=com_modules");

        await browser.click("button.js-stools-btn-clear");
        await browser.waitLoad();

        let client_id = await browser.getValue("#client_id");
        if (client_id != options.args[0]) {
            await browser.setValue("#client_id", options.args[0]);
            await browser.waitLoad();
        }

        await browser.setValue("#filter_search", options.args[2]);
        await browser.click("button:has(.icon-search)");
        await browser.waitLoad();

        list = await joomla.getLines(
            "#j-main-container > table",
            [9]
        );

        for (let i = 0; i < list.length; i++) {
            const id = list[i][0];

            if (options.args[1] == id) {
                await browser.click("[name='cid[]'][value=" + id + "]");

                await browser.click("#toolbar-trash button");
                await browser.waitLoad();

                const msg = await browser.getText("#system-message-container .alert-message");
                console.log(" " + msg);

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
