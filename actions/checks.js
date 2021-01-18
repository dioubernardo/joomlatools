const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        console.log("Site: " + options.site);

        await joomla.go("/administrator/index.php?option=com_installer&view=warnings");
        const warnings = await browser.getText("#system-message-container .alert-message");
        console.log(" Warnings: " + warnings);

        await joomla.go("/administrator/index.php?option=com_installer&view=database");
        const database = await browser.getText("#system-message-container .alert-message");
        console.log(" Database: " + database);

        await joomla.go("/administrator/index.php?option=com_installer&view=manage");

        if (await browser.setValue("#filter_status", 0))
            await browser.waitLoad();

        if (await browser.setValue("#list_limit", 0))
            await browser.waitLoad();

        let list = await joomla.getLines(
            "#j-main-container > table",
            [2, 7]
        );
        let extensionsNonJoomla = [];
        list.forEach(item => {
            if (item[1] != "Joomla! Project")
                extensionsNonJoomla.push(item[1]);
        });
        if (extensionsNonJoomla != "")
            console.log(" Non Joomla extensions disabled: \n  -" + extensionsNonJoomla.join("\n  -"))

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
