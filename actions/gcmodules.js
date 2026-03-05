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

        await browser.setValue("#list_limit", "0");
        await browser.waitLoad();

        // removendo modulos não publicados
        await browser.setValue("#filter_state", "0");
        await browser.waitLoad();
        list = await joomla.getLines(
            "#j-main-container > table",
            [7]
        );
        if (list.length > 0) {
            await joomla.checkAll();
            await browser.confirm(true);
            await browser.click("#toolbar-trash button");
            await browser.waitLoad();

            const msg = await browser.getText("#system-message-container .alert-message");
            console.log(" " + msg);
        }

        // removendo modulos do lixo
        await browser.setValue("#filter_state", "-2");
        await browser.waitLoad();
        list = await joomla.getLines(
            "#j-main-container > table",
            [7]
        );
        if (list.length > 0) {
            await joomla.checkAll();
            await browser.confirm(true);
            await browser.click("#toolbar-delete button");
            await browser.waitLoad();

            const msg = await browser.getText("#system-message-container .alert-message");
            console.log(" " + msg);
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
