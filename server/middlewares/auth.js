const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL

function authCheck(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect(`${FRONTEND_BASE_URL}/auth`);
}

module.exports = authCheck