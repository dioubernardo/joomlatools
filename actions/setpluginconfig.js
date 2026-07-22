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
        let list = await joomla.getContent([7]);
        if (list.length == 0) {
            throw new Error("Plugin não encontrado: " + options.args[0]);
        }else if (list.length > 1) {
            throw new Error("Mais de um plugin encontrado: " + options.args[0]);
        }

        const id = list[0][0];
        await browser.click("[name='cid[]'][value=" + id + "]");
        await joomla.clickWaitShowMsg("#toolbar-edit button");

        var configs = JSON.parse(options.args[1]);
        for (const key in configs) {
            console.log(" " + key + " = " + configs[key]);
            await browser.setValue("[name='jform[params][" + key + "]']", configs[key]);
        }
        await joomla.clickWaitShowMsg("#toolbar-save button");
        await log.write(`Aplicada configurações ao plugin "${options.args[0]}"`);
    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
