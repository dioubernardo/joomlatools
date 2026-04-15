const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        var configs = JSON.parse(options.args[0]);
        for (const component in configs) {
            if (component == "_"){
                console.log("Configurando Sistema");
                await joomla.go("/administrator/index.php?option=com_config");
            }else{
                console.log("Configurando " + component);
                await joomla.go("/administrator/index.php?option=com_config&view=component&component=" + component);
            }

            for (const key in configs[component]) {
                console.log(" " + key + " = " + configs[component][key]);
                if (key == "smtppass")
                    await browser.click("#jform_smtppass_lock");
                if (key.substring(0, 1) == "#"){
                    await browser.setValue(key.replace(/\./g, "\\."), configs[component][key]);
                }else{
                    await browser.setValue("[name='jform[" + key + "]']", configs[component][key]);
                }
            }

            await joomla.clickWaitShowMsg("#toolbar-apply button");
        }

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
