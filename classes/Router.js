import { Validator } from './Validator.js';
import { RouterOptions } from './RouterOptions.js';
import { AuthHandler } from './AuthHandler.js';
import { Response } from './Response.js';
export class Router {
    options
    router
    pathPrefix
    pathSuffix
    validator = new Validator()
    authHandler = new AuthHandler()
    multer
    response = new Response()
    routeHandlerMapping = {}
    responseContentType = 'application/json'
    actionsWithoutAuth = {
        get: [],
        post: [],
        put: [],
        patch: [],
        delete: [],
        head: [],
        options: []
    }
    options = new RouterOptions()
    constructor(router ,options = {}, pathPrefix = null, pathSuffix = null, responseContentType = `application/json`) { 
        this.router = router
        this.pathPrefix = pathPrefix
        this.pathSuffix = pathSuffix 
        this.setValidator()
        this.setAuthHandler()
        this.setResponseContentType(responseContentType)
    } 
    setValidator(validator =  new Validator()) {
        this.validator = validator
    }
    setAuthHandler(authHandler = new AuthHandler()) {
        this.authHandler = authHandler
    }
    setResponseContentType(contentType) {
        this.responseContentType = contentType
    }
    setMulter(multerReference) {
        this.multer = multerReference
    }
    cleanPath = (path) => path.replace(/\/\//g, "/");

    getNormalizedPath(path) { 
        return [this.pathPrefix || ``, path = this.cleanPath(path), this.pathSuffix || ``].filter((el) =>  el !== `` ).join(`/`)
    }
    setupAuthConfig(method, path ,options) {
        const {auth} =  options 
        if(auth) return  
        this.actionsWithoutAuth[method].push(path) 
    }
    setupFormDataConfig(method, path, options) { 
        options.isFormData = options.isFormData || false
    }
    setupMulterConfig(method, path, options) { 
        if(!this.multerReference) return  
        if(options.multer) 
            options.isFormData = true
        if(options.isFormData && !options.multer) 
            options.multer = (multerRef) =>  this.multerReference().any()
    }
    getAllowedMethods = () => Object.keys(this.actionsWithoutAuth)
    route(method,path,cb,options = {}) {  
        method = method.toLowerCase()
        if(!this.getAllowedMethods().includes(method)) throw new Error(`Invalid method ${method} passed to route`)
        path = this.getNormalizedPath(path) 
        if(!cb) throw new Error(`Unable to register route ${method.toUpperCase()} ${path}, as callback  undefined...`);
        const {handler, fileFieldRules} = !options.validations? {handler: cb, fileFieldRules: null}: {
            handler: this.getValidationFn(options, cb), 
            fileFieldRules: this.getFileFieldRules(options.validations)
        };  
        options = options || this.options;
        
        this.setupAuthConfig(method, path, options)
        this.setupFormDataConfig(method, path, options) 
        this.setupMulterConfig(method, path, options)
        this.setRouteHandler(method, path, handler, options) 
    }
    get(path, cb, options = {}) {
        this.route(`get`, path, cb, options)
    }
    post(path, cb, options = {}) {
        this.route(`post`, path, cb, options)
    }
    put(path, cb, options = {}) {
        this.route(`put`, path, cb, options)
    }
    patch(path, cb, options = {}) {
        this.route(`patch`, path, cb, options)
    }
    delete(path, cb, options = {}) {
        this.route(`delete`, path, cb, options)
    }
    head(path, cb, options = {}) {
        this.route(`head`, path, cb, options)
    }
    setRouteHandler(method, path, handler, options) { 
        const {isFormData} = options
        if(!isFormData)  
            this.router[method](path, async (req, res, next) => { 
                await (this.getHandlerForRoute)(method, path)(req, res, next)
                if(!res.headersSent) 
                handler(req, res, next) 
                
            })
        else  
            this.router[method](path, (options.multer)(multer), (req, res, next) => (this.getHandlerForRoute(method, path))(req, res, next))
    }
    getKeyForRouteHandlerMapping(method, route) {
        return `${method} ${route}`
    }
    setHandlerForRoute(method, route, handler) {
        if(!handler) return
        const key = this.getKeyForRouteHandlerMapping(method, route)
        this.routeHandlerMapping[key] = handler
    }
    async handleAuth(path, req, res, next) {  
        const route = this.router.route(path)
        path = route && route.path? route.path: null 
        if(!path) return 
        const method =  req.method.toLowerCase()  
        const noAuthActions  =  this.actionsWithoutAuth[method]?this.actionsWithoutAuth[method]:[] 
        const isActionWithAuth = !noAuthActions.includes(path)  
        if(!isActionWithAuth) return 
        const {errors, httpResponseCode} = await this.authHandler.authenticate(req, res, next, {route}) 
        if(errors)
            this.sendResponse(req, res, this.response.error(errors, null), httpResponseCode)
    }
    getHandlerForRoute(method, route) {
        return async (req,res,next) => {   
            const key = this.getKeyForRouteHandlerMapping(method, route) 
            const handler = this.routeHandlerMapping[key]  
            const nextFn = !handler ? next: () => handler(req,res,next)  
            res.setHeader('Content-Type', this.responseContentType) 
            await this.handleAuth(route, req, res, nextFn);  
        }
    } 
    getFileFieldRules() { 
        //will define later in next version
        return {};
    }
    sendResponse(req, res, data, httpResponseCode = 200) { 
        if(res.headersSent) return
        res.status(httpResponseCode).send(data)
    }
    getValidationFn = (options, cb) => {
        return async (req,res,next) => { 
            let {validations}  = options    
            validations =  JSON.parse(JSON.stringify(validations))
            this.validator.setRules(validations)
            let data = this.validator.findParams(req)
            let errors = await this.validator.validate(data)
            if(!errors.length) {
                await this.validator.onSuccess(data)
                return cb(req,res,next)
            }
            const {errors: errs, data: info, httpResponseCode} = await this.validator.onFailure(errors, data) 
            return this.sendResponse(req, res, this.response.error(errs, info), httpResponseCode)
        }
    }
    geExpressRouterInstance() {
        return this.router
    }
}