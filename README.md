
## Sample Usage
To initialize the router with existing expressjs router  

    import express  from 'express'
    import {Router} from  "nmicro-router"

    //Initialize with express router
    const router = new Router(express.Router())

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






    