(function ($) {

  var templates = {
    table: '<table class="table table-bordered table-striped">' +
      '<thead>{{>columnHeaders}}</thead>' +
      '<tbody>' +
        '{{#players}}{{>playerRow}}{{/players}}' +
      '</tbody>' +
    '</table>',

    columnHeaders: '<tr>' +
      '<th>#</th>' +
      '<th>Name</th>' +
      '<th>Wk 1</th>' +
      '<th>Wk 2</th>' +
      '<th>Wk 3</th>' +
      '<th>Wk 4</th>' +
      '<th>Wk 5</th>' +
      '<th>Wk 6</th>' +
      '<th>Wk 7</th>' +
      '<th>Pts</th>' +
    '</tr>',

    playerRow: '<tr>' +
      '<td>{{pos}}</td>' +
      '<td>{{name}}</td>' +
      '<td>{{#week1Pos}}{{>positionCell}}{{/week1Pos}}</td>' +
      '<td>{{#week2Pos}}{{>positionCell}}{{/week2Pos}}</td>' +
      '<td>{{#week3Pos}}{{>positionCell}}{{/week3Pos}}</td>' +
      '<td>{{#week4Pos}}{{>positionCell}}{{/week4Pos}}</td>' +
      '<td>{{#week5Pos}}{{>positionCell}}{{/week5Pos}}</td>' +
      '<td>{{#week6Pos}}{{>positionCell}}{{/week6Pos}}</td>' +
      '<td>{{#week7Pos}}{{>positionCell}}{{/week7Pos}}</td>' +
      '<td>{{points}}</td>' +
    '</tr>',

    positionCell: '<span>{{value}}</span>' +
      '{{#winner}}<span class="glyphicon glyphicon-star" ' +
      'style="padding-left: 6px; color: gold;" aria-hidden="true"></span>{{/winner}}'
  };

  $.getJSON('data.json', { _: new Date().getTime() }).then(function (data) {
    var tableData = createTableData(data);

    // For now, just render the current week's results
    var tableHtml = Mustache.to_html(templates.table, tableData[tableData.length - 1], templates);
    $('#table-area').html(tableHtml);
  });

  function createTableData(data) {
    var tables = [createTableDataForWeek(data)];
    var week = tables[0].week - 1;

    while (week > 0) {
      tables.unshift(createTableDataForWeek(data, week));
      week = week - 1;
    }

    return tables;
  }

  function createTableDataForWeek(data, week) {
    var currentWeek = 0;
    var playerData = _.sortBy(_.map(data.players, function (playerData) {
      // Calculate the player points
      var name = playerData[0];
      var results = _.map(playerData.slice(1), function (val, i) {
        return (val < 0 || i >= week) ? null : val;
      });

      // Calculate the player points
      var points;
      points = _.slice(results, 0, week || results.length);

      // Calculate the current week
      week = _.findIndex(points, _.isNull);
      week = week > 0 ? week : points.length;
      currentWeek = Math.max(currentWeek, week);

      points = _.filter(points, function (val) { return val !== null && val > 0; });
      points = points.sort(function (a, b) { return a - b; });
      points = _.slice(points, 0, data.useBest || points.length);
      points = _.reduce(points, function (sum, val) {
        return sum + data.points[val - 1];
      }, 0);

      var playerObj = {
        name: name,
        points: points
      };

      _.each(results, function (val, i) {
        playerObj['week' + (i + 1) + 'Pos'] = {
          value: val !== null ? val : '-',
          winner: val === 1
        };
      });

      return playerObj;
    }), 'points').reverse();

    // Add the position as a property in player data
    _.each(playerData, function (val, i) { val.pos = i + 1; });

    return {
      week: currentWeek,
      players: playerData
    };
  }

  function arrayLength(length, newLength) {
    if (!_.isInteger(newLength) || (newLength < 0 || newLength > length)) {
      return length;
    }

    return newLength;
  }

})($);
