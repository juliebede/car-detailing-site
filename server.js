
const express = require('express');
const { Client } = require('pg');
const bodyParser = require("body-parser");
const path = require('path')
const app = express();
const port = process.env.PORT || process.env.ALTERNATIVE_PORT;

// Use the below to do queries through here
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Connects to database
client.connect(err => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected to database')
  }
})

app.use(bodyParser.json());

// Books an appointment and adds information to the database
app.post('/addAppointment', (req, res) => {
  const client = req.body.clientInputs;
  const phone = client.phone;

  // add/updates clients into data
  // add the appointment in the data
  // yearly update of the database
  client.query(`
    INSERT INTO clients ("first_name", "last_name", "email", "phone", "text")
    VALUES 
      ('${client.first_name}',
      ' ${client.last_name}', 
      '${client.email}', 
      '${client.phone}', 
      ${client.text})
    ON CONFLICT ("phone") DO UPDATE
      SET text = EXCLUDED.text,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email;
    
    INSERT INTO appointments ("client_id", "service_id", "start_time", "end_time", "date", "year")
       VALUES
        ((SELECT id FROM clients WHERE phone = '${phone}'),
        ${req.body.serviceId},
        ${Number(req.body.startTime)},
        ${Number(req.body.endTime)},
        ${req.body.date},
        ${req.body.year});
    
    UPDATE availability 
    SET booked = TRUE
    WHERE timeslot >= ${Number(req.body.startTime)} AND timeslot < ${Number(req.body.endTime)}
          AND date = '${req.body.date}';

    DELETE from appointments WHERE year < ${req.body.year};`
  )
  .then(res => {
    console.log(res);
  })
  .catch(err => console.log('query error', err.stack))

})

// add's the schedule
app.post('/addSchedule', (req, res) => {
  const schedule = req.body.dates;

  // apply yearly maintenace by deleting data if it is from the previous year
  client.query(`
    DELETE from availability WHERE year < ${req.body.year}`)
    .then(res => { console.log(res) })
    .catch(err => console.log('query error', err.stack));
  
  // add schedule to database
  for (let date in schedule) {
    let times = schedule[date];
    for (let time in times) {
      client.query(`
        INSERT INTO availability ("timeslot", "date", "booked", "year")
        VALUES
          (${time},
          '${date}',
           ${times[time]},
           ${date.slice(6)})`)
           .then(res => {
            console.log(res);
          })
          .catch(err => console.log('query error', err.stack))
    }
  }
});


// gets all the timeslots for the day
app.get('/getTimes/:month/:day/:year', function (req, res) {
  const date = `${req.params.month}/${req.params.day}/${req.params.year}`;
  client.query(`
    SELECT booked,
           timeslot
    FROM availability 
    WHERE date = '${date}'`)
    .then(data => {
      let formattedData = {};
      for (let row of data.rows) {
        formattedData[row.timeslot] = row.booked;
      }
      res.send(formattedData);
    })
    .catch(err => console.log(err.stack))
})

// gets all the services 
app.get('/getServices', function (req, res) {
  client.query(`
    SELECT * FROM services
    ORDER BY id`)
    .then(data => {
      res.send(data.rows);
    })
    .catch(err => console.log(err.stack))
})

// gets information on the service based on its id
app.get(`/getService/:id`, function (req, res) {
  const service = req.params.id;
  console.log(service)
  client.query(`
    SELECT * FROM services
    WHERE id=${service}`)
    .then(data => {
      res.send(data.rows);
    })
    .catch(err => console.log(err.stack))
})

// handles production mode
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'))
}

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get(`/*`, function (request, response){
  response.sendFile(path.resolve('client/build/index.html'))
})

app.listen(port, () => console.log(`App Listening!`))