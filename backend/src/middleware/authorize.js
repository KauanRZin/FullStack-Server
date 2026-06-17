module.exports = (...permittedRoles) => (req, res, next) => {
  if (!req.user) {
    const err = new Error('Não autenticado');
    err.status = 401;
    return next(err);
  }

  if (!permittedRoles.includes(req.user.role)) {
    const err = new Error('Acesso negado');
    err.status = 403;
    return next(err);
  }

  next();
};