const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.goAndClickClear("/administrator/index.php?option=com_users&view=levels");

        let list = await joomla.getContent([2, 4]);

        let aremover = options.args[0].split(",");
        let achou = false;

        for (let i = 0; i < list.length; i++) {
            const item = list[i][0];
            const id = list[i][1];

            if (aremover.includes(item)) {
                await browser.click("[name='cid[]'][value=" + id + "]");
                achou = true;
            }
        }

        if (achou){
            await joomla.clickWaitShowMsg("#toolbar-delete button");
            await log.write(`Nível de acesso "${options.args[0]}" removido`);
        }else{
            console.log(" Not found " + options.args[0]);
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
