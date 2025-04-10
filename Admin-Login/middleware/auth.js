const auth = (req, res, next) => {
  console.log("Auth middleware check:", {
    path: req.path,
    sessionID: req.sessionID,
    isAuthenticated: req.session?.isAuthenticated,
    user: req.session?.user,
  });

  if (!req.session || !req.session.isAuthenticated) {
    console.log("Authentication failed, redirecting to login");
    return res.status(401).redirect("/Admin-Login/admin-login.html");
  }

  console.log("Authentication successful");
  next();
};

module.exports = auth;
