const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

function authCheck(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // Check if it's an API request (e.g., XHR or fetch)
  const isApiRequest = req.headers.accept?.includes("application/json") || req.xhr;

  if (isApiRequest) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Otherwise redirect (for page navigation)
  res.redirect(`${FRONTEND_BASE_URL}/auth`);
}

module.exports = authCheck;
