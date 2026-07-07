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

        await joomla.goAndClickClear("/administrator/index.php?option=com_menus&view=menus");

        await joomla.changeWait("#client_id", 0);
        await joomla.searchWait(options.args[0]);

        const list = await joomla.getContent([1, 6]);

        if (list.length == 0) {
            return;
        }else if (list.length > 1) {
            await log.write(`Mais de um menu encontrado com o título "${options.args[0]}"`);
            return;
        }

        const title = list[0][0];
        const id = list[0][1];

        await browser.click("[name='cid[]'][value=" + id + "]");
        await joomla.clickWaitShowMsg("#toolbar-delete button");
        await log.write(`Menu "${title}" removido do site`);

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
