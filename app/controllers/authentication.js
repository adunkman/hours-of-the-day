var request = require("request");
var Harvest = require("../services/harvest");

var authentication = module.exports = {};

var host = process.env.SERVER_URL || "http://localhost:8080";
var clientId = process.env.HARVEST_CLIENT_ID;
var clientSecret = process.env.HARVEST_CLIENT_SECRET;
var e = encodeURIComponent;

authentication.requireAuth = function (req, res, next) {
  var createHarvestServiceAndContinue = function () {
    (req.services = req.services || {}).harvest =
      new Harvest(req.session.token, req.session.user);
    return next();
  };

  if (req.session.token && req.session.user) {
    if (req.session.token.expires_on > new Date().getTime()) {
      return createHarvestServiceAndContinue();
    }

    request.post(Harvest.url(req.session.user.company.full_domain.split(".")[0], "/oauth2/token"), {
      form: {
        refresh_token: req.session.token.refresh_token,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token"
      }
    }, function (err, response, body) {
      if (err) {
        return next(err);
      }
      if (response.statusCode != 200) {
        return next("Unexpected status code: " + response.statusCode);
      }
      try {
        var token = JSON.parse(body);
        token.expires_on = new Date().getTime() + token.expires_in * 1000;
        req.session.token = token;
      }
      catch (e) {
        return next(e);
      }

      return createHarvestServiceAndContinue();
    });
  }

  res.redirect("/signin?redirect_uri=" + e(req.url));
};

authentication.signinForm = function (req, res) {
  var subdomain = (req.query.subdomain || "").trim();

  if (subdomain) {
    return res.redirect(Harvest.url(subdomain, "/oauth2/authorize", {
      client_id: clientId,
      redirect_uri: host + "/signin/callback?subdomain=" + e(subdomain) + "&redirect_uri=" + e(req.query.redirect_uri),
      state: "optional-csrf-token",
      response_type: "code"
    }));
  }

  res.render("signin/form", {
    redirectUri: req.query.redirect_uri
  });
};

authentication.callback = function (req, res, next) {
  var authorizationCode = req.query.code;
  var subdomain = req.query.subdomain;
  var redirectUri = req.query.redirect_uri;

  request.post(Harvest.url(subdomain, "/oauth2/token"), {
    form: {
      code: authorizationCode,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: host + "/signin/callback?subdomain=" + e(subdomain) + "&redirect_uri=" + e(redirectUri),
      grant_type: "authorization_code"
    }
  }, function (err, response, body) {
    if (err) {
      return next(err);
    }
    if (response.statusCode != 200) {
      return next("Unexpected status code: " + response.statusCode);
    }
    try {
      var token = JSON.parse(body);
      token.expires_on = new Date().getTime() + token.expires_in * 1000;
      req.session.token = token;
    }
    catch (e) {
      return next(e);
    }

    request.get(Harvest.url(subdomain, "/account/who_am_i"), {
      json: true,
      headers: {
        authorization: "Bearer " + req.session.token.access_token
      }
    }, function (err, response, body) {
      if (err) {
        return next(err);
      }
      if (response.statusCode != 200) {
        return next("Unexpected status code: " + response.statusCode);
      }

      req.session.user = body;
      res.redirect(redirectUri || "/");
    });
  });
};
