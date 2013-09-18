#Simple Restify API

- A micro API using nodejs, restify and mongoose

--- 

- Clone the repository

```bash
$ git clone git@github.com:<your-github-username>/simple-restify-api.git
```

- Enter in the folder

```bash
$ cd simple-restify-api
```

- Instal dependences

```bash
$ sudo npm install
```

- Run app.js

```bash
$ node app.js
```

- To test the api, use cURL 
	- Exemples:
	
```bash
$ curl -i http://localhost:3000/user
$ curl -i -X POST -d 'param=value' http://localhost:3000/page
```

- For run the tests, use mocha

```bash
$ cd test
$ mocha
``` 
