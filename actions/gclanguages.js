const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.goAndClickClear("/administrator/index.php?option=com_languages&view=languages");

        await joomla.changeWait("#list_limit", "0");

        await joomla.changeWait("#filter_published", "0");
        if (await joomla.hasContent()) {
            await joomla.checkAll();
            await joomla.clickWaitShowMsg("#toolbar-trash button");
            await log.write("Enviado para lixeira linguagens de conteúdo não publicadas");
        }

        await joomla.changeWait("#filter_published", "-2");
        if (await joomla.hasContent()) {
            await joomla.checkAll();
            await joomla.clickWaitShowMsg("#toolbar-delete button");
            await log.write("Removidas linguagens de conteúdo não publicadas");
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
