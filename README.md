# Simple CRUD Api apllication (Node.js & TS)

## How to install application

1. Clone this repo 

```bash 
$ git clone https://github.com/SlavaPankov/simple-crud-api
```

2. Checkout to develop branch 

```bash 
$ git checkout develop
```

3. Install dependencies 

```bash 
$ npm install
```

## How to tun application

Server post for listening requests can be configured as an enviroment variable, for example look at ".env.example" file.

This application provide three modes. 

Run application in development mode: 

```bash
$ npm run start:dev
```

Run application in production mode:

```bash
$ npm run start:prod
```

Run application in cluster mode with an in-memory database for all workers and a default loader balancer:

```bash
$ npm run start:multi
```

## Testing

This application contians a few tests. To run this test:

```bash
$ npm run test
```

## Working with Api

`api/users` - it's the endpoint.

Method `GET` + `api/users` - Get all users.

Method `GET` + `api/users/${userId}` - Get a user by id

Method `POST` + `api/users` - Create a new user

Method `PUT` + `api/users/${userId}` - Update an existing user.

Method `DELETE` + `api/users/${userId}` - Delete an existing user.

### User fields

`username` — user name (`string`);

`age` — user age (`number`);

`hobbies` — user hobbies (`array of string`).