
class Joomla {

    constructor(browser, site) {
        this.browser = browser;
        this.site = site;
    }

    async go(url) {
        await this.browser.go(this.site + url);
    }

    async goAndClickClear(url){
        await this.go(url);
        await this.browser.click("button.js-stools-btn-clear");
        await this.browser.waitLoad();
    }

    async clickWaitShowMsg(button, prefixMSG = " "){
        await this.browser.confirm(true);
        await this.browser.click(button);
        await this.browser.waitLoad();

        const selectormsg = "#system-message-container .alert-message";
        if (await this.browser.hasObject(selectormsg)) {
            const msg = await this.browser.getText(selectormsg);
            console.log(prefixMSG + msg);
            return msg;
        }
        return null;
    }

    async login(user, password) {

        await this.go("/administrator/");

        if ((await this.browser.hasObject("body.com_login")) != true)
            throw "Invalid login screen";

        await this.browser.setValue("#mod-login-username", user);
        await this.browser.setValue("#mod-login-password", password);

        await this.browser.click(".login-button");
        await this.browser.waitLoad();

        if ((await this.browser.hasObject("body.com_cpanel")) != true) {
            const msg = await this.browser.getText("#system-message-container .alert-message");
            if (!msg)
                throw "Undefined login error";
            throw msg;
        }
    }

    async checkAll() {
        await this.browser.exec(`
            jQuery("[name=checkall-toggle]").trigger("click");
        `);
    }

    async searchWait(text){
        await this.browser.setValue("#filter_search", text);
        await this.browser.click("button:has(.icon-search)");
        await this.browser.waitLoad();
    }

    async getLines(selector, columns) {
        const result = await this.browser.exec(`
            let ret = [];
            let columns = `+ JSON.stringify(columns) + `;
            jQuery(`+ JSON.stringify(selector) + ` + " tbody tr").each(function(){
                let line = []
                let tds = jQuery(this).find("td");
                columns.forEach(function(col){
                    line.push(tds.eq(col).text().trim());
                });
                ret.push(line);
            });
            return ret;
        `);
        return result;
    }

    sleep(u) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, u);
        });
    }

}

module.exports = Joomla;
