const ChromeLauncher = require("chrome-launcher");
const CDP = require("chrome-remote-interface");

class Browser {

    constructor(options) {
        this.options = options;
    }

    async start() {
        let chromeFlags = [];
        if (this.options.headless) {
            chromeFlags.push("--headless");
        }
        const chrome = await ChromeLauncher.launch({
            chromeFlags: chromeFlags,
            logLevel: this.options.logLevel,
            maxConnectionRetries: 10
        });
        this.chrome = chrome;
    }

    async go(url) {
        this.client = await CDP({ port: this.chrome.port });
        const { Network, Page } = this.client;
        await Network.enable();
        await Page.enable();
        await Page.navigate({ url: url });
        await this.waitLoad();
    }

    async waitLoad() {
        const { Page } = this.client;
        await Page.loadEventFired().then(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, this.options.delayload);
            });
        });
    }

    async exec(script) {
        const { Runtime } = this.client;
        const expression = `({
            returned: function(){
                if (typeof jQuery == "undefined") throw "jQuery is not present on the informed site";
                ` + script + `
            }()
        })`;
        const result = await Runtime.evaluate({
            expression,
            returnByValue: true
        });
        if (result.exceptionDetails && result.exceptionDetails.exception) {
            if (result.exceptionDetails.exception.description)
                throw result.exceptionDetails.exception.description;
            else if (result.exceptionDetails.exception.value)
                throw result.exceptionDetails.exception.value;
            else
                throw "Unidentified exception";
        }
        return result.result.value.returned;
    }

    async setValue(selector, value) {
        const changed = await this.exec(`
            const sel = ` + JSON.stringify(selector) + `;
            const o = jQuery(sel);
            if (o.length == 0)
                throw "Object " + sel + " not found";
            const v = ` + JSON.stringify(value) + `;
            if (o.val() != (""+v)){
                o.val(v).triggerHandler("change");
                return true;
            }
            return false;
        `);
        return changed;
    }

    async click(selector) {
        await this.exec(`
            const sel = ` + JSON.stringify(selector) + `;
            const o = jQuery(sel);
            if (o.length == 0)
                throw "Object " + sel + " not found";
            o.click();
        `);
    }

    async hasObject(selector) {
        const result = await this.exec(`
            return jQuery(` + JSON.stringify(selector) + `).length != 0;
        `);
        return result;
    }

    async getText(selector) {
        const result = await this.exec(`
            const sel = ` + JSON.stringify(selector) + `;
            const o = jQuery(sel);
            if (o.length == 0)
                throw "Object " + sel + " not found";
            return o.text();
        `);
        return result.trim();
    }

    async confirm(result) {
        await this.exec(`
            window.confirm = function(){ return ` + JSON.stringify(result) + `; }
        `);
    }

    end() {
        try {
            this.client.close();
        } catch (err) { }

        try {
            this.chrome.kill();
        } catch (err) { }
    }

}

module.exports = Browser;
