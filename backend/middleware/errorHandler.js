export const notFound = (req, res, next) => {
    res.status(404).json({ message: `Route not Found - ${req.originalUrl}` });
    // next(error);
};

export const errorHandler = (err, req, res, next) => {
    console.log(err);
    const statusCode = res.statusCode && res.statusCode != 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        message: err.message || "Server Error",
    });
};
