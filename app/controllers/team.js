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

          entry.started_at_day_offset = startedAt.diff(today);
          entry.ended_at_day_offset = endedAt.diff(today);
        });
      });

      res.render("reports/workHours", { team: results });
    });
  });
};
