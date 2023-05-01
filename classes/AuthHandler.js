import { AuthAdapter } from "./AuthAdapter.js"
export class AuthHandler {
    adapter
    failureResponseHttpCode = 401
    constructor(adapter =  new AuthAdapter()) {
        this.adapter = adapter
    }
    setAdapter(adapter) {
        this.adapter = adapter
    }
    async authenticate(req, res, next, options = {}) { 
        if(!this.adapter) return  {data: null, error: null}
        const {data, error} =  await this.adapter.authenticate(req, res, next, options)  
        if(error) 
            return await this.onFailure(error, req, res, next, options)
        return await this.onSuccess(data, req, res, next, options)
    }
    onFailure = async (error, req, res, next, options) => {
        const errors = [{
            type: `auth-failure`,
            message: error
        }]
        return {errors, httpResponseCode: this.failureResponseHttpCode}
    }
    onSuccess = async (data, req, res, next, options) => {
        req.identity =  data 
        return {errors: null, data}
    }
}