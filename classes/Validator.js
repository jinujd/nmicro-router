import { ValidationAdapter } from "./ValidationAdapter.js"
export class Validator {
    adapter = new ValidationAdapter()
    rules
    failureResponseHttpCode = 400
    validationSegments = [`params`, `query`, `body`]
    constructor(adapter, rules) {
        this.adapter = adapter 
        this.setRules(rules)
    }
    setAdapter(adapter = new ValidationAdapter()) {
        this.adapter = adapter
    }
    setRules(rules) {
        this.rules = rules
    } 
    cleanRules() {
        const cleanedParams = {...this.rules} 
        const paramsToDelete = ["$$validateIn" ] 
        paramsToDelete.forEach(param => delete cleanedParams[param]) 
        return cleanedParams
    }
    findParams =  (req) => (this.rules.$$validateIn || this.validationSegments).reduce( (result, item) => ({...result, ...(req[item] || {})}),{}) 
    async validate(params) {
        if(!this.adapter) return []  
        return await this.adapter.validate(params, this.cleanRules(this.rules)) 
    }
    onFailure = async (errors, data) => ({errors, data, httpResponseCode: this.failureResponseHttpCode })
    onSuccess =  async (data) => data 
}