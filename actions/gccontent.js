const Browser = require("../browser.js");
const Joomla = require("../joomla.js");

async function run(options) {
    let browser, joomla;

    async function filterStateAndClick(field, state, button){
        await joomla.changeWait(field, state);

        while(true){
            list = await joomla.getLines(
                "#j-main-container > table",
                [0]
            );
            if (list.length > 0) {
                await joomla.checkAll();
                await joomla.clickWaitShowMsg(button);
            }else{
                break;
            }
        }
    }

    try {
        browser = new Browser(options);
        await browser.start();

        joomla = new Joomla(browser, options.site);

        await joomla.login(options.user, options.password);

        // ** Desbloqueando conteudo **
        await joomla.go("/administrator/index.php?option=com_checkin");
        let list = await joomla.getLines(
            "#j-main-container > table",
            [0]
        );
        if (list.length > 0) {
            await joomla.checkAll();
            await joomla.clickWaitShowMsg("button.button-checkin");
        }

        // ** GC nos artigos **
        await joomla.goAndClickClear("/administrator/index.php?option=com_content");
        // movendo não publicados para lixeira
        await filterStateAndClick("#filter_published", "0", "#toolbar-trash button");
        // limpando a lixeira
        await filterStateAndClick("#filter_published", "-2", "#toolbar-delete button");


        // ** GC nos itens de menu **
        await joomla.goAndClickClear("/administrator/index.php?option=com_menus&view=items&menutype=");
        // movendo não publicados para lixeira
        await filterStateAndClick("#filter_published", "0", "#toolbar-trash button");
        // limpando a lixeira
        await filterStateAndClick("#filter_published", "-2", "#toolbar-delete button");


        // ** GC nos módulos **
        await joomla.goAndClickClear("/administrator/index.php?option=com_modules");
        // movendo não publicados para lixeira
        await filterStateAndClick("#filter_state","0", "#toolbar-trash button");
        // limpando a lixeira
        await filterStateAndClick("#filter_state", "-2", "#toolbar-delete button");


        // ** GC nos banners **
        await joomla.goAndClickClear("/administrator/index.php?option=com_banners");
        // movendo não publicados para lixeira
        await filterStateAndClick("#filter_published","0", "#toolbar-trash button");
        // limpando a lixeira
        await filterStateAndClick("#filter_published", "-2", "#toolbar-delete button");


        // ** GC nos contatos **
        await joomla.goAndClickClear("/administrator/index.php?option=com_contact");
        // movendo não publicados para lixeira
        await filterStateAndClick("#filter_published","0", "#toolbar-trash button");
        // limpando a lixeira
        await filterStateAndClick("#filter_published", "-2", "#toolbar-delete button");


        // ** GC nos fields dos usuários **
        await joomla.goAndClickClear("/administrator/index.php?option=com_fields&context=com_users.user");
        // movendo não publicados para lixeira
        await filterStateAndClick("#filter_state","0", "#toolbar-trash button");
        // limpando a lixeira
        await filterStateAndClick("#filter_state", "-2", "#toolbar-delete button");


        // ** GC nos fields dos artigos **
        await joomla.goAndClickClear("/administrator/index.php?option=com_fields&context=com_content.article");
        // movendo não publicados para lixeira
        await filterStateAndClick("#filter_state","0", "#toolbar-trash button");
        // limpando a lixeira
        await filterStateAndClick("#filter_state", "-2", "#toolbar-delete button");


        // ** GC nos fields dos contatos **
        await joomla.goAndClickClear("/administrator/index.php?option=com_fields&context=com_contact.contact");
        // movendo não publicados para lixeira
        await filterStateAndClick("#filter_state","0", "#toolbar-trash button");
        // limpando a lixeira
        await filterStateAndClick("#filter_state", "-2", "#toolbar-delete button");


        // ** GC Menus Vazios **
        await joomla.goAndClickClear("/administrator/index.php?option=com_menus&view=menus");
        await joomla.changeWait("#list_limit", "0");

        list = await joomla.getLines(
            "#j-main-container > table",
            [2, 3, 4, 6]
        );
        if (list.length > 0) {
            let achou = false;
            for (let i = 0; i < list.length; i++) {
                const qntPub = list[i][0];
                const qntNPub = list[i][1];
                const qntLixo = list[i][2];
                const id = list[i][3];
                if (qntPub == "0" && qntNPub == "0" && qntLixo == "0") {
                    await browser.click("[name='cid[]'][value=" + id + "]");
                    achou = true;
                }
            }
            if (achou) {
                await joomla.clickWaitShowMsg("#toolbar-delete button");
            }
        }


        // ** GC categorias vazias **
        let ultimoerro = "";
        let repeticao = 0;
        async function gcCategoriasVazias(state, button, extension){
            await joomla.goAndClickClear("/administrator/index.php?option=com_categories&extension=" + extension);
            await joomla.changeWait("#list_limit", "0");
            await joomla.changeWait("#filter_published", state);

            let temdados = await browser.hasObject("#j-main-container > table");
            if (!temdados) {
                return false;
            }

            let ehMultiidioma = await browser.getText("#j-main-container > table th:eq(9)") == 'Associação';

            list = await joomla.getLines(
                "#j-main-container > table",
                [3, 4, 5, 6, 7, ehMultiidioma ? 11 : 10]
            );
            let achou = false;
            for (let i = 0; i < list.length; i++) {
                const qntPub = list[i][1];
                const qntNPub = list[i][2];
                const qntArq = list[i][3];
                const qntLixo = list[i][4];
                const id = list[i][5];
                const proximoehFilho = list[i+1] != undefined && (list[i+1][0].substring(0,1) == "-" || list[i+1][0].substring(0,1) == "┊");
                const semcategoria = list[i][0].match(/(Sem categoria|Uncategorised|Nenhuma Categoria|uncategorised)/i) != null;
                if (qntPub == "0" && qntNPub == "0" && qntLixo == "0" && qntArq == "0" && !proximoehFilho && !semcategoria) {
                    await browser.click("[name='cid[]'][value=" + id + "]");
                    achou = true;
                }
            }
            if (achou) {
                let msg = await joomla.clickWaitShowMsg(button);
                if (ultimoerro == msg) {
                    repeticao++;
                    if (repeticao == 3) {
                        console.log("Erro repetido 3 vezes");
                        return false;
                    }
                }else{
                    ultimoerro = msg;
                    repeticao = 0;
                }
            }
            return achou;
        }
        // limpando categorias vazias
        while(await gcCategoriasVazias("", "#toolbar-trash button", "com_content"));
        while(await gcCategoriasVazias("", "#toolbar-trash button", "com_banners"));
        while(await gcCategoriasVazias("", "#toolbar-trash button", "com_contact"));

        // limpando categorias do lixo
        while(await gcCategoriasVazias("-2", "#toolbar-delete button", "com_content"));
        while(await gcCategoriasVazias("-2", "#toolbar-delete button", "com_banners"));
        while(await gcCategoriasVazias("-2", "#toolbar-delete button", "com_contact"));

    } catch (err) {
        throw err;
    } finally {
        browser.end();
    }

}

module.exports = run;
