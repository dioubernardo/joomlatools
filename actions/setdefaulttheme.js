const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.goAndClickClear("/administrator/index.php?option=com_templates&view=styles");

        await joomla.changeWait("#filter_template", options.args[0]);
        let list = await joomla.getContent([5]);
        if (list.length == 1){
            const id = list[0][0];
            await browser.click("[name='cid[]'][value=" + id + "]");
            await joomla.clickWaitShowMsg("#toolbar-default button");
            await log.write(`Definido tema ${options.args[0]} como padrão`);
        }else{
            throw "Deve exitir apenas um estilo para o tema " + options.args[0] + " para ser definido como padrão. Encontrados: " + list.length;
        }

        await joomla.goAndClickClear("/administrator/index.php?option=com_installer&view=manage");

        await joomla.changeWait("#filter_type", "template");
        await joomla.changeWait("#filter_client_id", 0);

        list = await joomla.getContent([2, 10]);
        let achou = false;
        let itens = [];
        for (let i = 0; i < list.length; i++) {
            const nome = list[i][0];
            const id = list[i][1];
            if (nome != options.args[0]) {
                achou = true;
                await browser.click("[name='cid[]'][value=" + id + "]");
                itens.push(nome);
            }
        }

        if (achou){
            await joomla.clickWaitShowMsg("#toolbar-delete button");
            await log.write(`Temas removidos: ${itens.join(", ")}`);
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
