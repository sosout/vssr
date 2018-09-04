# vssr-start

> Start Vssr.js Application in production mode.

## Installation

```bash
npm install --save vssr-start
````

Add/Update your "start" script into your `package.json`:

```json
{
	"scripts": {
		"start": "vssr-start"
	}
}
```

## Usage

```bash
vssr-start <dir> -p <port number> -H <hostname> -c <config file>
```

## Programmatic Usage

```js
const { Vssr } = require('vssr-start')

// Require vssr config
const config = require('./vssr.config.js')

// Create a new vssr instance
const vssr = new Vssr(config)

// Start vssr.js server
vssr.listen(3000) // vssr.listen(port, host)

// Or use `vssr.render` as an express middleware
```
