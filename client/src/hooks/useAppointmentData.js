import axios from "axios";
import { useReducer, useEffect } from "react";
import { addDays } from 'date-fns';

const GET_SERVICES = "GET_SERVICES";
const CHANGE_DATE = "CHANGE_DATE"
const CHANGE_SERVICE = "CHANGE_SERVICE";

function reducer(state, action) {
  switch (action.type) {
    case GET_SERVICES: {
      return {...state, allServices: action.value}
    }
    case CHANGE_DATE: {
      return {...state, startTime: '', endTime: '', date: action.value}

    }
    case CHANGE_SERVICE: {
      return {...state, startTime: '', endTime:'', serviceInfo: action.value}
    }
    default:
      throw new Error();
  }
}

export default function useAppointmentData() {
  const [bookingInput, dispatch] = useReducer(reducer, {
    date: addDays(new Date(), 1),
    startTime: '',
    endTime: '',
    serviceInfo: {},
    allServices: []
  });

  // gets all services in database
  useEffect(() => {
    axios.get('/getServices')
    .then((res) => dispatch({type: GET_SERVICES, value: res.data}));
  }, []);

  const changeDate = date => dispatch({ type: CHANGE_DATE, value: date })

  function changeService(id) {
    return axios.get(`/getService/${id}`)
    .then(res => dispatch({ type: CHANGE_SERVICE, value: (res.data[0]) }));
  }

  return { bookingInput, changeDate, changeService }
}