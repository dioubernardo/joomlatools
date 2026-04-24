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
        await joomla.searchWait("Editor - TinyMCE");

        if (!await joomla.hasContent()){
            throw new Error("Plugin 'Editor - TinyMCE' não encontrado");
        }

        await joomla.checkAll();
        await joomla.clickWaitShowMsg("#toolbar-edit button");

        // Configurar 2
        await browser.click("#set-2 button[data-preset=advanced]");
        await browser.setValue("#jform_params__configuration__setoptions__2__invalid_elements", "script,applet");

        // Configurar 1
        await browser.click("#set-tabs a[href='#set-1']");
        await browser.click("#set-1 button[data-preset=advanced]");
        await browser.setValue("#jform_params__configuration__setoptions__1__invalid_elements", "script,applet");

        // Configurar 0
        await browser.click("#set-tabs a[href='#set-0']");
        await browser.click("#set-0 button[data-preset=advanced]");
        await browser.setValue("#jform_params__configuration__setoptions__0__invalid_elements", "script,applet");

        await joomla.clickWaitShowMsg("#toolbar-save button");
        await log.write("Padronizada configuração do TinyMCE");

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
