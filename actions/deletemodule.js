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
        await joomla.unlockContent();

        // limpando modulos inuteis
        await joomla.goAndClickClear("/administrator/index.php?option=com_modules");

        await joomla.changeWait("#client_id", options.args[0]);

        await joomla.searchWait(options.args[2]);

        list = await joomla.getContent([9]);

        for (let i = 0; i < list.length; i++) {
            const id = list[i][0];

            if (options.args[1] == id) {
                await browser.click("[name='cid[]'][value=" + id + "]");

                await joomla.clickWaitShowMsg("#toolbar-trash button");

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
