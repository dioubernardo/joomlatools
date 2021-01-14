const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;
    
    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        let list = await joomla.openListFullRecords(
            "/administrator/index.php?option=com_installer&view=update",
            "#j-main-container > table",
            [1, 4, 5]
        );

        if (list.length > 0) {
            console.log("Site: " + options.site);
            list.forEach(update => {
                console.log(" " + update[0] + " from " + update[1] + " to " + update[2]);
            });
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
