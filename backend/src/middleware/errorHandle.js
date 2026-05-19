const errorHandle = (err, req, res, next) => {
    const status = err.status || 500
    res.redirect(`https://http.cat/${status}`)
}

module.exports = errorHandler