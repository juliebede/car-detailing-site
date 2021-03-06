import React, { useState } from 'react';
import { addDays,
        format,
        compareAsc,
        getYear } from 'date-fns';
import RestrictionForm from './RestrictionForm'
import { getLastAddedDate } from '../helpers/getLastAddedDate';
const axios = require('axios').default;

export default function AddSchedule() {
  // localStorage.clear(); // uncomment to start date over to current

  const [dates, changeDates] = useState({})
  const [minMaxDates, changeMinMax] = useState([])


  function addSchedule() {
    // add the last scheduled date to localstorage
    let stringDate = format(minMaxDates[1], 'MM/dd/yyyy')
    localStorage.setItem('last_date', stringDate);
    axios.post('/addSchedule', {dates, year: getYear(new Date())});
  }

  // Adds dates with default times
  function addDates() {
    let date = new Date(); // creates a date (which is today)
    let lastAddedDate = getLastAddedDate();
    if (lastAddedDate !== null) {
      console.log(lastAddedDate)
      if (compareAsc(lastAddedDate, date) === 1) { // if the last added date is later
        date = addDays(lastAddedDate, 1); // we will add the schedule after this date
      }
    }
    changeMinMax([date]) // add min date

    // add the next 14 days to availability
    for (let count = 0; count <= 14; count++) {
      if (count === 14) {
        // eslint-disable-next-line no-loop-func
        changeMinMax((prev) => {return [...prev, date]})
      }
      const formattedDate = format(date, 'MM/dd/yyyy');

      // set the default availability
      changeDates((prev) => {
        return {
          ...prev,
          [formattedDate]: {
            8: false, 8.5: false, 9: false, 9.5: false, 10: false,
            10.5: false, 11: false, 11.5: false, 12: false, 12.5: false, 1: false,
            1.5: false, 2: false, 2.5: false, 3: false, 3.5: false, 4: false,
            4.5: false, 5: false,
          }
        }});
      date = addDays(date, 1)
    }
  }
  
  return (
    <div>
      <button onClick={addDates}>Add two weeks</button>
      { Object.keys(dates).length !== 0 && 
      <RestrictionForm dates={dates} changeDates={changeDates} minMaxDates={minMaxDates} /> }
      <button onClick={addSchedule}>Submit</button>
    </div>
  )
}
