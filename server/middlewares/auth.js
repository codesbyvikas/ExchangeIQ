const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

function authCheck(req, res, next) {
  // 🔍 Debug logs
  console.log("🧠 Session:", req.session);
  console.log("🙋‍♂️ User:", req.user);

  // Safety check + authentication logic
  if (typeof req.isAuthenticated === "function" && req.isAuthenticated()) {
    return next();
  }

  const isApiRequest = req.headers.accept?.includes("application/json") || req.xhr;

  if (isApiRequest) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.redirect(`${FRONTEND_BASE_URL}/auth`);
}

module.exports = authCheck;
