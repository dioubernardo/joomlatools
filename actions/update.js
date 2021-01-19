const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        await joomla.go("/administrator/index.php?option=com_joomlaupdate");
        await browser.click("#toolbar-loop button");
        await browser.waitLoad();

        if (await browser.hasObject("#online-update button:not(.btn-warning)")) {
            let list = await joomla.getLines(
                "#online-update table",
                [1]
            );
            console.log(" Update from " + list[0][0].replace(/^\?/, "") + " to " + list[1][0].replace(/^\?/, ""));

            await browser.click("#online-update button");
            await browser.waitLoad();

            let tries = 0;
            let lastp = "";
            while (true) {
                tries++;
                await joomla.sleep(1000);

                try {
                    if (await browser.hasObject("#content .alert")) {
                        console.log(" Process 100.0%");
                        const msg = await browser.getText("#content .alert");
                        console.log(" Result: " + msg);
                        break;
                    }

                    const p = await browser.getText("#extpercent");
                    if (p != lastp) {
                        console.log(" Process " + p.padStart(6, " "));
                        lastp = p;
                    }
                } catch (err) {
                }

                if (tries > 300)
                    throw " Timeout Joomla update";
            }
        } else {
            const msg = await browser.getText("#online-update .alert");
            console.log(" Joomla is updated - " + msg);
        }

        await joomla.go("/administrator/index.php?option=com_installer&view=discover");

        if (await browser.setValue("#list_limit", 0))
            await browser.waitLoad();

        let list = await joomla.getLines(
            "#j-main-container > table",
            [1, 8]
        );
        const count = list.length;
        if (count > 0) {
            console.log(" Starting extra extensions removal process");
            for (let i = 0; i < count; i++) {

                if (i > 0)
                    console.log("");

                console.log("  " + ((i + 1) + "").padStart(("" + count).length, " ") + "/" + count + " " + list[i][0]);

                try {
                    const id = list[i][1];

                    await joomla.go("/administrator/index.php?option=com_installer&view=discover");

                    await browser.click("[name='cid[]'][value=" + id + "]");

                    await browser.click("#toolbar-upload button");
                    await browser.waitLoad();

                    let msg = await browser.getText("#system-message-container .alert-message");
                    console.log("   Install result: " + msg);

                    await joomla.go("/administrator/index.php?option=com_installer&view=manage");
                    await browser.setValue("#filter_search", "ID:" + id);
                    await browser.click("#filter_search + button");
                    await browser.waitLoad();

                    await browser.click("[name='cid[]'][value=" + id + "]");

                    await browser.confirm(true);
                    await browser.click("#toolbar-delete button");
                    await browser.waitLoad();

                    msg = await browser.getText("#system-message-container .alert-message");
                    console.log("   Uninstall result: " + msg);

                } catch (err) {
                    console.log("   Error: " + err);
                }

            }
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
