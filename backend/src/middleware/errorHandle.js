const errorHandle = (err, req, res, next) => {
    const status = err.status || 500

    const message = err.message || 'Algo deu errado no servidor!';
    res.status(status).json({
        error: true,
        status: status,
        message: message,
        catReference: `https://http.cat/${status}`
    });
}

module.exports = errorHandle