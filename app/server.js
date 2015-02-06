if (process.env.NODE_ENV === "production") {
  require("newrelic");
}

var app = require("express")();
var path = require("path");
var controllers = require("./controllers");

app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));

app.use(require("morgan")("dev"));

app.use(require("connect-assets")({
  paths: [
    "app/assets/javascripts",
    "app/assets/stylesheets",
    "vendor/assets/javascripts"
  ]
}));

app.use(require("cookie-session")({
  keys: (process.env.COOKIE_KEYS || "insecure").split(",")
}));

app.use(controllers.authentication.requireAuth);

app.get("/signin", controllers.authentication.signinForm);
app.get("/signin/callback", controllers.authentication.callback);

app.get("/", controllers.team.workHoursReport);

app.listen(process.env.PORT || 8080, function () {
  console.log("listening:", this.address());
});
