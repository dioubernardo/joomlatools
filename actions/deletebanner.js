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

        await joomla.goAndClickClear("/administrator/index.php?option=com_banners");
        await joomla.changeWait("#list_limit", "0");

        /* Removendo */
        if (options.args[0] == "*"){
            await joomla.checkAll();
            await log.write("Removendo TODOS os banners");
        }else{
            const ids = options.args[0].split(",").map(x => x.trim()).filter(x => x != "");
            for (const id of ids){
                await browser.click("[name='cid[]'][value=" + id + "]");
            }
            await log.write("Removendo os banners com os IDs: " + ids.join(", "));
        }
        await joomla.clickWaitShowMsg("#toolbar-trash button");

        /* Limpando a lixeira */
        await joomla.changeWait("#filter_published", "-2");
        if (await joomla.hasContent()) {
            await joomla.checkAll();
            await joomla.clickWaitShowMsg("#toolbar-delete button");
            await log.write("Limpando a lixeira");
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }
}

module.exports = run;
