const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        // desbloqueando conteudo
        await joomla.go("/administrator/index.php?option=com_checkin");
        let list = await joomla.getLines(
            "#j-main-container > table",
            [1]
        );
        if (list.length > 0) {
            await joomla.checkAll();
            await browser.click("button.button-checkin");
            await browser.waitLoad();

            const msg = await browser.getText("#system-message-container .alert-message");
            console.log(" " + msg);
        }

        // movendo para lixeira artigos não publicados
        await joomla.go("/administrator/index.php?option=com_content");

        await browser.click("button.js-stools-btn-clear");
        await browser.waitLoad();

        async function filterStateAndClick(state, button){
            await browser.setValue("#filter_published", state);
            await browser.waitLoad();

            while(true){
                list = await joomla.getLines(
                    "#j-main-container > table",
                    [0]
                );
                if (list.length > 0) {
                    await joomla.checkAll();
                    await browser.confirm(true);
                    await browser.click(button);
                    await browser.waitLoad();

                    const msg = await browser.getText("#system-message-container .alert-message");
                    console.log(" " + msg);
                }else{
                    break;
                }
            }
        }

        // movendo artigos não publicados para lixeira
        await filterStateAndClick("0", "#toolbar-trash button");

        // limpando a lixeira
        await filterStateAndClick("-2", "#toolbar-delete button");

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
