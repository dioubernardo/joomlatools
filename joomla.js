
class Joomla {

    constructor(browser, site) {
        this.browser = browser;
        this.site = site;
    }

    async go(url) {
        await this.browser.go(this.site + url);
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
