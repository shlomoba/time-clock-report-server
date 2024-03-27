const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const moment = require('moment');
const _ = require('lodash');
let mock = {};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send(mock);
});

app.get('/timecard', (req, res) => {
  const { month, year } = req.query;

  let found = _.get(mock, [year], false);
  if (found === false) {
    mock = { ...mock, [year]: {} };
  }

  found = _.get(mock, [year, month], false);
  if (found === false) {
    const daysInMonth = moment(`${year}-${month}`, 'YYYY-MM').daysInMonth();
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

    const daysMock = days.reduce((total, day) => {
      total[day] = { date: `${day}`, start: null, end: null, count: 0 };
      return total;
    }, {});
    mock[year][month] = daysMock;
  }

  const data = Object.values(mock[year][month]);
  const total = calculateTotal(data);

  res.send({
    data,
    total
  });
});

function calculateTotal(data) {
  return data.reduce((count, item) => {
    count += item.count;
    return count;
  }, 0);
}

app.patch('/timecard', (req, res) => {
  const { year, month, date, start, end } = req.body;
  let found = mock[year][month][date];
  found.start = start;
  found.end = end;
  //
  let count = new Date(end) - new Date(start);
  count = count / 1000 / 60 / 60;
  found.count = count;

  res.send({ ...found });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
