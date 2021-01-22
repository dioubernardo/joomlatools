const axios = require("axios");
const fs = require("fs");

function splitParameter(txt, sep) {
    const pos = txt.indexOf(sep);
    if (pos == -1)
        return [txt, ""];
    return [
        txt.substr(0, pos),
        txt.substr(pos + 1, txt.length - pos + 1)
    ];
}

async function main() {

    try {

        let options = {
            headless: true,
            delayload: 250,
            logLevel: "error",
            action: "",
            args: [],
            site: "",
            sites: "",
            user: "",
            password: ""
        };

        const args = process.argv.slice(2);
        args.forEach(arg => {
            if (arg.substr(0, 2) == "--") {
                const attr = splitParameter(arg.substr(2), "=");
                switch (typeof options[attr[0]]) {
                    case "boolean":
                        if (attr[1] == "")
                            options[attr[0]] = true;
                        else
                            options[attr[0]] = (attr[1].toLowerCase() == "true");
                        break;
                    case "string":
                        options[attr[0]] = attr[1];
                        break;
                    case "undefined":
                        throw "Invalid parameter: " + arg;
                }
            } else {
                if (options.action == "")
                    options.action = arg.toLowerCase();
                else
                    options.args.push(arg);
            }
        });

        let domains = [];
        if (options.sites != "") {
            const sites = splitParameter(options.sites, ":");
            switch (sites[0]) {
                case "json":
                    const response = await axios.get(sites[1]);
                    domains = response.data;
                    break;
                case "txt":
                    const data = fs.readFileSync(sites[1], "utf8");
                    domains = data.toString().split(/[\n,;\s]/).filter((value, index, self) =>{
                        return value != "" && self.indexOf(value) === index;
                    });
                    break;
                default:
                    throw "--sites must be \"format:destination\", possible formats: txt or json";
            }
        } else if (options.site != "") {
            domains = [options.site];
        } else {
            throw "You must inform the parameter --site or --sites";
        }

        for (let i = 0; i < domains.length; i++) {

            options.site = domains[i];
            if (options.site.substr(options.site.length - 1) == "/")
                options.site = options.site.substr(0, options.site.length - 1);
            if (!/^https?:\/\//.test(options.site))
                options.site = "https://" + options.site;

            console.log("\nRunning on " + options.site);

            switch (options.action) {
                case "listupdates":
                    const listupdates = require("./actions/listupdates.js");
                    await listupdates(options);
                    break;

                case "updateextension":
                    const updateextension = require("./actions/updateextension.js");
                    await updateextension(options);
                    break;

                case "checks":
                    const checks = require("./actions/checks.js");
                    await checks(options);
                    break;

                case "update":
                    const update = require("./actions/update.js");
                    await update(options);
                    break;

                case "installpendingextension":
                    const installpendingextension = require("./actions/installpendingextension.js");
                    await installpendingextension(options);
                    break;

                default:
                    throw "Invalid action: " + options.action;
            }
        }

    } catch (err) {
        console.error("Error: " + err);
    } finally {
        process.exit();
    }

}

main();
