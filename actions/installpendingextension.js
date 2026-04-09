const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.goAndClickClear("/administrator/index.php?option=com_installer&view=discover");

        await joomla.clickWaitShowMsg("#toolbar-refresh button");

        await joomla.changeWait("#list_limit", 0);

        if (options.args[0])
            await joomla.searchWait(options.args[0]);

        let list = await joomla.getContent([1, 8, 3]);
        let plugins = [];
        let itens = [];
        for (let i = 0; i < list.length; i++) {
            const nome = list[i][0];
            const id = list[i][1];
            const type = list[i][2];
            if (!options.args[0] || options.args[0] == nome) {
                itens.push(nome);
                await browser.click("[name='cid[]'][value=" + id + "]");
                if (type == "Plugin") {
                    plugins.push(nome);
                }
            }
        }

        async function ativarPlugin(nome){
            await joomla.goAndClickClear("/administrator/index.php?option=com_plugins");
            await joomla.searchWait(nome);
            let list = await joomla.getContent([3, 7]);
            let achou = false;
            for (let i = 0; i < list.length; i++) {
                const nm = list[i][0];
                const id = list[i][1];
                if (nome == nm) {
                    achou = true;
                    console.log("Ativando plugin: " + nome);
                    await browser.click("[name='cid[]'][value=" + id + "]");
                    await joomla.clickWaitShowMsg("#toolbar-publish button");
                }
            }
            if (!achou) {
                console.log("Plugin não encontrado para ativação: " + nome);
            }
        }

        if (itens.length > 0){
            console.log("Instalando: " + itens.join(", "));
            await joomla.clickWaitShowMsg("#toolbar-upload button");

            if (plugins.length > 0) {
                for (let i = 0; i < plugins.length; i++) {
                    await ativarPlugin(plugins[i]);
                }
            }
        }else{
            console.log("Nenhuma extensão encontrada para instalação");
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
