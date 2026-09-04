class AppError extends Error{
    constructor(statusCode, message, error){
        super(message);
        this.success = false
        this.statusCode = statusCode
        this.error = error
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = AppError

