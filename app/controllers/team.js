var _ = require("underscore");
var async = require("async");
var moment = require("moment");

var team = module.exports = {};

team.workHoursReport = function (req, res, next) {
  req.services.harvest.get("/people", function (err, people) {
    if (err) {
      return next(err);
    }

    var activePeople = _.filter(people, function (person) {
      return person.user.is_active;
    });

    var requests = _.map(activePeople, function (person) {
      return function (callback) {
        req.services.harvest.get("/daily", {
          of_user: person.user.id
        }, function (err, entries) {
          return callback(err, {
            user: person.user,
            entries: entries.day_entries
          });
        });
      };
    });

    async.parallel(requests, function (err, results) {
      if (err) {
        return next(err);
      }

      var format = "h:mma";
      var today = moment().startOf("day");

      _.each(results, function (teamMember) {
        _.each(teamMember.entries, function (entry) {
          var startedAt = moment(entry.started_at, format);
          var endedAt = entry.ended_at ? moment(entry.ended_at, format) : moment();

          if (endedAt.isBefore(startedAt)) {
            endedAt.add(1, "day");
          }

          entry.started_at_day_offset = percentOfDay(startedAt.diff(today));
          entry.ended_at_day_offset = percentOfDay(Math.min(86400000, endedAt.diff(today)));
        });
      });

      var labels = _.map("12:00am, 3:00am, 6:00am, 9:00am, 12:00pm, 3:00pm, 6:00pm, 9:00pm".split(", "), function (time) {
        return {
          text: time,
          offset: percentOfDay(moment(time, format).diff(today))
        };
      });

      labels.push({
        text: "12:00am",
        offset: percentOfDay(86400000)
      });

      res.render("reports/workHours", {
        team: results,
        labels: labels
      });
    });
  });
};

var percentOfDay = function (milliseconds) {
  return milliseconds / 86400000 * 100;
};
