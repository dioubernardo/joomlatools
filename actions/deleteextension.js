const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options, log) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.goAndClickClear("/administrator/index.php?option=com_installer&view=manage");

        await joomla.searchWait(options.args[0]);

        let list = await joomla.getContent([2, 10]);

        let achou = false;
        for (let i = 0; i < list.length; i++) {
            const item = list[i][0];
            const id = list[i][1];

            if (options.args[0] == item) {
                await browser.click("[name='cid[]'][value=" + id + "]");
                achou = true;
            }
        }


        if (achou){
            await joomla.clickWaitShowMsg("#toolbar-delete button");
            await log.write(`Extensão ${options.args[0]} removida`);
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
