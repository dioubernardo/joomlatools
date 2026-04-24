const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        // ** Desbloqueando conteudo **
        await joomla.unlockContent();

        async function changeLang(option){
            const url = "/administrator/index.php?option=" + option;
            await joomla.goAndClickClear(url);

            await joomla.changeWait("#filter_language", options.args[0]);
            await joomla.changeWait("#list_limit", "0");

            if (await joomla.hasContent()) {
                await joomla.checkAll();
                await browser.click("#toolbar-batch button");

                await joomla.sleep(2000);

                await browser.setValue("#batch-language-id", options.args[1]);
                await joomla.clickWaitShowMsg(".modal-footer button[type='submit']");

                await log.write(`Conteúdo em ${option} alterado de ${options.args[0]} para ${options.args[1]}`);
            }
        }

        await changeLang("com_content");
        await changeLang("com_contact");
        await changeLang("com_banners");
        await changeLang("com_modules");

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
