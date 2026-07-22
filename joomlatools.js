const axios = require("axios");
const fs = require("fs");
const Logs = require("./logs.js");

const validcommands = [
    "listupdates",
    "updateextension",
    "checks",
    "update",
    "installpendingextension",
    "disableplugin",
    "deleteviewlevel",
    "deleteextension",
    "clearfinderindex",
    "deletemodule",
    "gccontent",
    "changecontentlang",
    "gclanguages",
    "disablecontentlang",
    "installptbr",
    "setdefaulttheme",
    "setglobalconfig",
    "setadvancedtoolbartinymce",
    "deletemenu",
    "setpluginconfig"
];

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
            sandbox: true,
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
        let showDomain = false;
        if (options.sites != "") {
            const sites = splitParameter(options.sites, ":");
            switch (sites[0]) {
                case "json":
                    const response = await axios.get(sites[1]);
                    domains = response.data;
                    break;
                case "txt":
                    const data = fs.readFileSync(sites[1], "utf8");
                    domains = data.toString().split(/[\n,;\s]/).filter((value, index, self) => {
                        return value != "" && self.indexOf(value) === index;
                    });
                    break;
                default:
                    throw "--sites must be \"format:destination\", possible formats: txt or json";
            }
            showDomain = true;
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

            if (showDomain)
                console.log("\nRunning on " + options.site);

            if (!validcommands.includes(options.action))
                throw "Invalid action: " + options.action;

            const log = new Logs(options.site);

            const action = require("./actions/"+options.action+".js");
            await action(options, log);
        }

        return 0;

    } catch (err) {
        console.error("Error: " + err);
        return 1;
    }

}

main().then(code => process.exit(code));
