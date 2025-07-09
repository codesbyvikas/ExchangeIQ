const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL;

function authCheck(req, res, next) {
  console.log('=== AUTH CHECK DEBUG ===');
  console.log('Session ID:', req.sessionID);
  console.log('req.isAuthenticated exists:', typeof req.isAuthenticated === 'function');
  console.log('req.isAuthenticated():', req.isAuthenticated());
  console.log('req.user:', req.user);
  console.log('Request path:', req.path);
  console.log('Request headers accept:', req.headers.accept);
  console.log('========================');

  if (req.isAuthenticated()) {
    console.log('✅ User authenticated, proceeding');
    return next();
  }

  console.log('❌ User not authenticated');

  // Check if it's an API request (e.g., XHR or fetch)
  const isApiRequest = req.headers.accept?.includes("application/json") || req.xhr;

  if (isApiRequest) {
    console.log('📱 API request detected, returning 401 JSON');
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Otherwise redirect (for page navigation)
  console.log('🔄 Browser request detected, redirecting to auth');
  res.redirect(`${FRONTEND_BASE_URL}/auth`);
}

module.exports = authCheck;