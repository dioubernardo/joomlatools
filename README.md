## Requirements

- NodeJS
- Google Chrome

## Installation

```
git clone https://github.com/dioubernardo/joomlatools.git
cd joomlatools
npm install
```

## Syntax

```
node joomlatools.js [options] [actions] [args]
```

## Options
    --headless = true | *empty* is true | false (default)
    --delayload = number of milliseconds to wait, 250 is the default
    --logLevel = silent | info | verbose | error (default) 
    --site = Site Domain base domain
    --sites = "format:destination", possible formats: txt or json
    --user = username
    --password = password

## Actions

### List Updates
List extensions updates
```
> node joomlatools.js --site=https://example.com --user=username --password=xxx listupdates
Running on https://example.com
 Phoca Gallery from 4.3.18 to 4.4.0
 Phoca Gallery Button Plugin from 4.3.11 to 4.4.0
 plg_content_furg from 1.1.80 to 1.1.81
```

### Installer Checks
Test installer warnings, Database and non Joomla extensions disabled
```
> node joomlatools.js --site=https://example.com --user=username --password=xxx checks
Running on https://example.com
 Warnings: Nenhuma advertência detectada
 Database: Aviso: Banco de Dados não está atualizado!
```

### Update extension
Update extension
```
> node joomlatools.js --site=https://example.com --user=username --password=xxx updateextension [extensionname]
Running on https://example.com
 Updating: plg_content_furg
 Result: Atualização de plugin concluída com sucesso.
```

### Update Joomla
Update Joomla
```
> node joomlatools.js --site=https://example.com --user=username --password=xxx update
Running on https://example.com
 Update from 3.9.23 to 3.9.24
 Process   0.0%
 Process   9.8%
 Process  18.9%
 Process  27.3%
 Process  50.0%
 Process  69.3%
 Process  83.4%
 Process 100.0%
 Result: Seu site foi atualizado com sucesso. A versão do seu Joomla agora é 3.9.24.
 Starting extra extensions removal process
  1/3 Autenticação - GMail
   Install result: Instalação de pendências com sucesso.
   Uninstall result: Desinstalação do plugin concluída com sucesso.

  2/3 Autenticação - LDAP
   Install result: Instalação de pendências com sucesso.
   Uninstall result: Desinstalação do plugin concluída com sucesso.

  3/3 Autenticação de Fator Duplo - Autenticador do Google
   Install result: Instalação de pendências com sucesso.
   Uninstall result: Desinstalação do plugin concluída com sucesso.
```
