const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        /* Instalando pt-BR */
        await joomla.goAndClickClear("/administrator/index.php?option=com_installer&view=languages");
        await joomla.searchWait('pt-BR');
        const linguagens = await joomla.getContent([2]);
        if (linguagens.length == 1){
            console.log("Instalando linguagem pt-BR...");
            await joomla.clickWaitShowMsg("#j-main-container .row0 input[type=button]");
            await log.write("Instalada linguagem pt-BR");
        }else{
            throw "Linguagem pt-BR não encontrada";
        }

        /* Tornando pt-BR a linguagem padrão */
        await joomla.goAndClickClear("/administrator/index.php?option=com_languages&view=installed");

        console.log("Tornando linguagem pt-BR padrão para o site...");
        await joomla.changeWait("#client_id", 0);
        await browser.click("[name=cid][value=pt-BR]");
        await joomla.clickWaitShowMsg("#toolbar-default button");
        await log.write("Tornada linguagem pt-BR padrão para o site");

        console.log("Tornando linguagem pt-BR padrão para o administrador...");
        await joomla.changeWait("#client_id", 1);
        await browser.click("[name=cid][value=pt-BR]");
        await joomla.clickWaitShowMsg("#toolbar-default button");
        await log.write("Tornada linguagem pt-BR padrão para o administrador");

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
