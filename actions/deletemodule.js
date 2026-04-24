const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        // desbloqueando conteudo
        await joomla.unlockContent();

        await joomla.goAndClickClear("/administrator/index.php?option=com_modules");

        await joomla.changeWait("#client_id", options.args[0]);
        await joomla.searchWait(options.args[2]);

        if (options.args[0] == 0)
            list = await joomla.getContent([3, 9]);
        else
            list = await joomla.getContent([3, 7]);

        for (let i = 0; i < list.length; i++) {
            const title = list[i][0];
            const id = list[i][1];

            if (options.args[1] == id || (options.args[1] == "*" && title == options.args[2])) {
                await browser.click("[name='cid[]'][value=" + id + "]");
                await joomla.clickWaitShowMsg("#toolbar-trash button");
                await log.write(`Módulo "${title}" removido do ` + (options.args[0] == 0 ? "site" : "administrador"));
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
