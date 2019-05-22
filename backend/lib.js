/// Contains general helper functions

/// parse a date in yyyy-mm-dd format
exports.parseDate = function (input) {
  var parts = input.split('-');
  // new Date(year, month [, day [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[0], parts[1] - 1, parts[2]); // Note: months are 0-based
}

exports.millisToDays = function (millis) {
  var days = millis / 86400000
  if (days < 0)
    return 0
  return days
}
