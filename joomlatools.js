
async function main() {

    try {

        let options = {
            headless: true,
            delayload: 250,
            logLevel: "error",
            action: "",
            site: "",
            user: "",
            password: ""
        };

        let args = process.argv.slice(2);
        args.forEach(arg => {
            if (arg.substr(0, 2) == "--") {
                let attr = arg.substr(2).split("=", 2);
                switch (typeof options[attr[0]]) {
                    case "boolean":
                        if (!attr[1])
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
                options.action = arg.toLowerCase();
            }
        });

        switch (options.action) {

            case "listupdates":
                const listupdates = require("./actions/listupdates.js");
                await listupdates(options);
                break;

            case "checks":
                const checks = require("./actions/checks.js");
                await checks(options);
                break;
    
            default:
                throw "Invalid action: " + options.action;
        }

    } catch (err) {
        console.error("Error: " + err);
    } finally {
        process.exit();
    }

}

main();
