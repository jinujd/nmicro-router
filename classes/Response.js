export class Response { 
    success = (data) => {
        return {
            success: true,
            data
        }
    }
    error = (errors, data) => {
        return {
            success: false,
            errors
        }
    }
}