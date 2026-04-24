const fs = require("fs");
const path = require("path");

class Logs {

	constructor(site) {
		this.site = site;
		this.filePath = path.join(__dirname, "logs.log");
		this.lastText = null;
	}

	static formatDate(date = new Date()) {
		const pad = value => String(value).padStart(2, "0");
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
	}

	async write(text) {
		if (text === this.lastText)
			return;
		this.lastText = text;
		const line = `${Logs.formatDate()} ${text} em ${this.site}\n`;
		await fs.promises.appendFile(this.filePath, line);
	}

}

module.exports = Logs;
