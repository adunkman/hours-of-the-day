var request = require("request");
var e = encodeURIComponent;

var Harvest = module.exports = function (token, user) {
  this.token = token;
  this.user = user;
};

Harvest.prototype.get = function (path, params, callback) {
  if (!callback) {
    callback = params;
    params = {};
  }

  var subdomain = this.user.company.full_domain.split(".")[0];

  request.get(Harvest.url(subdomain, path, params), {
    json: true,
    headers: {
      authorization: "Bearer " + this.token.access_token
    }
  }, function (err, response, body) {
    if (err) {
      return callback(err);
    }
    if (response.statusCode != 200) {
      return callback("Unexpected status code: " + response.statusCode);
    }

    return callback(null, body);
  });
};

Harvest.url = function (subdomain, path, params) {
  var url = "https://" + e(subdomain) + ".harvestapp.com" + path;

  if (params) {
    var parts = [];

    for (var key in params) {
      parts.push(e(key) + "=" + e(params[key]));
    }

    url += "?" + parts.join("&");
  }

  return url;
};
