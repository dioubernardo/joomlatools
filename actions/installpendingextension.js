const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.go("/administrator/index.php?option=com_installer&view=discover");

        if (await browser.setValue("#list_limit", 0))
            await browser.waitLoad();

        await browser.setValue("#filter_search", options.args[0]);

        await browser.click("#filter_search + button");
        await browser.waitLoad();

        let list = await joomla.getLines(
            "#j-main-container > table",
            [1, 8]
        );

        if (list.length > 0) {
            let items = []
            list.forEach(update => {
                items.push(update[0]);
            });
            console.log(" Installing: " + items.join(", "));

            await browser.click("[name=checkall-toggle]");

            await browser.click("#toolbar-upload button");
            await browser.waitLoad();
             
            const msg = await browser.getText("#system-message-container .alert-message");
            console.log(" Result: " + msg);
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
