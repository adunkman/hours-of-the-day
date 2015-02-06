var CookieDough = CookieDough || {};

(function () {
  CookieDough.Router = Backbone.Router.extend({
    routes: {
      "": "initializeTimeChart"
    },

    initializeTimeChart: function () {
      new CookieDough.Views.TimeChart({
        el: $(".js-time-chart")
      }).render();
    }
  });

  $(document).ready(function () {
    new CookieDough.Router();
    Backbone.history.start({ pushState: true });
  });
})();
