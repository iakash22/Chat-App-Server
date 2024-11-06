const errorMiddleware = (err, req, res, next) => {
    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;

    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern);
        err.message = `${field} already taken. Please choose a different one`;
        err.statusCode = 400;
    }

    if (err.name === "CastError") {
        err.message = `Invalid format of ${err.path}`;
        err.statusCode = 400;
    }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message,
    })
}

const TryCatch = (passedFunc) => async (req, res, next) => {
    try {
        // console.log("try");
        await passedFunc(req, res, next);
    } catch (error) {
        // console.log("catch");
        next(error);
    }
}

module.exports = { errorMiddleware, TryCatch };