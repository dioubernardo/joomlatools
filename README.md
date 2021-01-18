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
node joomlatools.js [options] [actions]
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
