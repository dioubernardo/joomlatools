const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        // ** Desbloqueando conteudo **
        await joomla.go("/administrator/index.php?option=com_checkin");
        let list = await joomla.getLines(
            "#j-main-container > table",
            [0]
        );
        if (list.length > 0) {
            await joomla.checkAll();
            await joomla.clickWaitShowMsg("button.button-checkin");
        }

        await joomla.goAndClickClear("/administrator/index.php?option=com_content");

        let changed = await browser.setValue("#filter_language", options.args[0]);
        if (!changed) {
            console.log("Falha na filtragem pelo idioma: " + options.args[0]);
            return;
        }
        await browser.waitLoad();

        await browser.setValue("#list_limit", "0");
        await browser.waitLoad();

        list = await joomla.getLines(
            "#j-main-container > table",
            [0]
        );
        if (list.length > 0) {
            await joomla.checkAll();
            await browser.click("#toolbar-batch button");

            await joomla.sleep(2000);

            await browser.setValue("#batch-language-id", options.args[1]);

            await joomla.clickWaitShowMsg(".modal-footer button[type='submit']");
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
