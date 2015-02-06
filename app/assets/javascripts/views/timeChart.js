var CookieDough = CookieDough || {};
CookieDough.Views = CookieDough.Views || {};

(function () {
  CookieDough.Views.TimeChart = Backbone.View.extend({
    initialize: function () {
      this.data = JSON.parse($(".js-time-chart-data").html());
      this.svg = d3.select(this.el);
      this.height = this.$el.height();
      this.width = this.$el.width();

      this.margin = {
        top: 0, bottom: 0,
        left: 0, right: 0
      };
    },

    render: function () {
      this.scales();
      this.team();
    },

    scales: function () {
      this.x = d3.scale.linear()
        .rangeRound([this.margin.left, this.width - this.margin.right])
        .domain([0, 86400000]);

      this.y = d3.scale.ordinal()
        .rangeRoundBands([this.margin.top, this.height - this.margin.bottom])
        .domain(_.map(this.data, function (teamMember) {
          return teamMember.user.first_name + " " + teamMember.user.last_name;
        }));

      console.log(this.y.range())
    },

    team: function () {
      var x = this.x;
      var y = this.y;

      this.svg.selectAll(".person").data(this.data).enter()
        .append("g")
        .attr({
          class: "person",
          "data-name": function (teamMember) {
            return teamMember.user.first_name + " " + teamMember.user.last_name;
          }
        })
        .selectAll(".entry").data(function (person) {
          return person.entries;
        }).enter()
          .append("rect")
          .attr({
            class: "entry",
            x: function (entry) {
              return x(entry.started_at_day_offset);
            },
            y: function (entry) {
              var teamMember = d3.select(this.parentNode).datum();
              return y(teamMember.user.first_name + " " + teamMember.user.last_name);
            },
            width: function (entry) {
              var end = Math.min(86400000, entry.ended_at_day_offset);
              return x(end - entry.started_at_day_offset);
            },
            height: y.rangeBand(),
            "data-entry": function (entry) {
              return entry.started_at + " – " + entry.ended_at;
            }
          });
    }
  });
})();
