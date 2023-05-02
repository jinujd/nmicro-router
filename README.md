
## Sample Usage
### Initialization with existing ExpressJS router
To initialize the router with existing expressjs router  

    import express  from 'express'
    import {Router} from  "nmicro-router"

    //Initialize with express router
    const router = new Router(express.Router())
    const app = express()
    app.use(router)
### Create a route 
    
    //Register a route GET /my-route
    router.route(`get` ,`/my-route`, (req, res, next) => {
        res.send(`Request received at route  ${req.method} my-route`)
    })
Or shorthand notation can be used as follows

    //Register a route GET /my-route
    router.get(`/my-route`, (req, res, next) => {
        res.send(`Request received at route  ${req.method} my-route`)
    })
Supported HTTP methods are get, post, put, patch, delete, head, options

For example, the following code registers a POST route.

    router.post(`my-route`, (req, res, next) => {
        res.send(``Request received at route ${req.method} my-route`)
    })

### Set up authentication for a route
To enable authenticator for routes, an auth adapter needs to be set for the router.

The AuthAdapter class should be defined in such a way that, it implements an async function called authenticate.

This function will be called whenever a request is received at the route. This function should return the following object

    {
        data: <Authentication information>,
        error: <Authentication error>
    }
data should contain the authentication data. error should contain the authentication error. If authentication is successful, pass error as null and data as non null value.
If authentication is unsuccessful, pass error as non null value. 

By default the authentication failure HTTP response code is 401. 
This can be configured.

Upon successful authentication, the the authentication data returned in data field will be available in express's request object with the key "identity". This key can be changed.

To enable authentication for a route, pass the auth field to true in the options argument.


#### Examples
Example with a custom secret based authentication

    import express  from 'express'
    import {Router, AuthHandler } from  "nmicro-router" 
    const router = new Router(express.Router())

    class CustomAuth {
        secret
        constructor(secret) {
            this.secret = secret
        }
        async authenticate(req, res, next, options) {
            const secretInHeader = req.headers['x-secret'] || ''
            if(secretInHeader != this.secret)
                return {data: null, error: new Error(`Incorrect secret`)}
            else 
                return {data: {"user": {id: 1, name: "John doe"}, error: null }}
        }
    }
    
    router.authHandler.setAdapter(new CustomAuth("my-secret")) 

    route.get("/route-with-auth", (req, res) => {
        res.send(`Successfully authenticated and authentication data is`, req.identity)
    }, { auth: true })

#### Additonal customisations for authenticator
Setting up the authentication failure HTTP response code
    
    router.authHandler.setAdapter(new CustomAuth("my-secret")) 
    router.authHandler.failureResponseHttpCode = 402 // failure code is set as 402

Setting up the auth data key.

    router.authHandler.setAuthDataField("authInfo")
    route.post("/route-with-auth", (req, res) => {
        res.send(`Successfully authenticated and authentication data is`, req.authInfo)
    }, { auth: true })

### Available auth adapters

The following auth adapters are available

#### JWT Auth Adapter 

[nmicro-jwt-auth](https://www.npmjs.com/package/nmicro-jwt-auth)



### Set up request validation for a route
To enable request validations, a vaidation adapter needs to be set for the router.

The Validator class should be defined so that, it implements an async function called validate. This function should return the list of identified validation errors as an array. If there are no errors identified, this function should return an empty array.

To enable validation for a route, pass the validations field with value as an object containing validation rules, in the options argument. These rules will be passed to the validate function in validator.

#### Examples 
Example with a validator that does required field validations.

    class RequiredValidator {
        validate(params, rules) {
            const errors = []
            rules.required.forEach(requiredParam => {
                if(params[requiredParam] === undefined) errors.push(`The parameter ${requiredParam} is required`)
            return errors
            })
        }
    }
    
    router.validator.setAdapter(new RequiredValidator())

    route.post("/create-user", (req, res) => {
        res.send(`Successfully validated`)
    },{  
        validations: {
            required: [ `name`, `age` ]
        } 
    })


#### Additonal customisations for validator
By default, validations will be done against
req.query, req.params and req.body

If validations should be done specifically, it can be done by configuring the $$validateIn property.

For example, the following code validates only against query and body

     route.post("/create-user", (req, res) =>   {
        res.send(`Successfully validated`)
    },{  
        validations: {
            $$validateIn: [`query`, `body`],
            required: [ `name`, `age` ]
        } 
    })

Example for validating headers

    route.post("/create-user", (req, res) =>   {
            res.send(`Successfully validated`)
        },{  
            validations: {
                $$validateIn: [`headers`],
                required: [ `name`, `age` ]
            } 
        })
### Available validation adapters

The following validation adapters are available

#### Fastest Validator

[nmicro-fastest-validator](https://www.npmjs.com/package/fastest-validator)

## Methods
### route(method, path, cb, options = {})
Creates a route with the specified method and path. 

All requests to the route are passed to the callback provided as argument cb.

Callback is the same callback passed to express's router. 

Express's request object, response object and next object is available as arguments for the callback.

The argument options is used to configure validator, authenticator etc. It is an optional argument
#### Example


    //Register a route GET /my-route
    router.route(`get` ,`/my-route`, (req, res, next) => {
        res.send(`Request received at route my-route`)
    })
    
    //Register a route DELETE
    router.route(`delete` ,`/my-route/:id`, (req, res, next) => {
        const {params: {id}} = req
        res.send(`Request received at route my-route with id`, id)
    })
Possible values of method arguments are 

    get, post, put, patch, delete, head, options

### get(path, cb, options)
Shorthand method for registering a GET route 
#### Example 
    router.get(`/my-route`, (req, res, next) => {
        res.send(`Request received at route my-route`)
    })

### post(path, cb, options)
Shorthand method for registering a POST route 
#### Example 
    router.post(`/my-route`, (req, res, next) => {
        res.send(`Request received at route my-route`)
    })
### put(path, cb, options)
Shorthand method for registering a PUT route 
#### Example 
    router.put(`/my-route`, (req, res, next) => {
        res.send(`Request received at route my-route`)
    })
### patch(path, cb, options)
Shorthand method for registering a PATCH route 
#### Example 
    router.patch(`/my-route`, (req, res, next) => {
        res.send(`Request received at route my-route`)
    })
### delete(path, cb, options)
Shorthand method for registering a DELETE route 
#### Example 
    router.delete(`/my-route`, (req, res, next) => {
        res.send(`Request received at route my-route`)
    })






    