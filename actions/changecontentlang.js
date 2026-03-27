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
        await joomla.unlockContent();

        async function changeLang(url){
            await joomla.goAndClickClear(url);

            await joomla.changeWait("#filter_language", options.args[0]);
            await joomla.changeWait("#list_limit", "0");

            if (await joomla.hasContent()) {
                await joomla.checkAll();
                await browser.click("#toolbar-batch button");

                await joomla.sleep(2000);

                await browser.setValue("#batch-language-id", options.args[1]);
                await joomla.clickWaitShowMsg(".modal-footer button[type='submit']");
            }
        }

        await changeLang("/administrator/index.php?option=com_content");
        await changeLang("/administrator/index.php?option=com_contact");
        await changeLang("/administrator/index.php?option=com_banners");
        await changeLang("/administrator/index.php?option=com_modules");

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
