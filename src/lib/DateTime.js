import moment from "moment";
import moments from "moment-timezone";

class DateTime {
  // To avoid the TimeZone issue with toISOString()
  static toISOString(date) {
    return moment(date).format("DD-MMM-YYYYT00:00:00.000") + "Z";
  }

  static formatDate(date) {
    return moment(date).format("DD-MMM-YYYY");
  }

  static toISOStringDate(date) {
    return moment(date).format("YYYY-MM-DD");
  }


  static formatedDate(date) {
    return moment(date).format("DD-MMM-YYYY hh:mm A");
  }


  static currentDate() {
    return moment().format("DD-MMM-YYYY hh:mm A");
  }
  static toISOEndTimeAndDate(date) {
    return moment(date).format("YYYY-MM-DDT23:59:59.000") + "Z";
  }

  /**
   * convert UTC time to local time
   *
   * @param date
   * @returns {null|*}
   */
  static UTCtoLocalTime(date, format) {
    if (!date) {
      return null;
    }
    let gmtDateTime = moment.utc(date);

    if (format) {
      return gmtDateTime.local().format(format);
    } else {
      return gmtDateTime.local().format("DD-MMM-YYYY hh:mm A");
    }
  }

  static getTimeZones(){
    return moments.tz.names();
  }
  static formatTimeShort(timeString) {
    const [hours, minutes] = timeString.match(/\d+/g);
      if (parseInt(minutes) > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${hours}h`;
    }
  }

  static LocalTime(date) {
    if (!date) {
      return null;
    }
    let gmtDateTime = moment.utc(date);

    return gmtDateTime.local().format("hh:mm A");
  }
  static getLocalTime(date) {
    if (!date) {
      return null;
    }
    
    let gmtDateTime = moment.utc(date);
  
    return gmtDateTime.local().format("HH:mm");
  }
  

  /**
   * convert UTC time to local time with seconds
   *
   * @param date
   * @returns {null|*}
   */
  static DateAndTime(date) {
    if (!date) {
      return null;
    }
    let gmtDateTime = moment.utc(date);

    return gmtDateTime.local().format("DD-MMM-YYYY hh:mm:ss A");
  }

  // UTC To Local Time And Mmm Format
  static UTCtoLocalTimeAndMmmFormat(date) {
    if (!date) {
      return null;
    }
    let gmtDateTime = moment.utc(date);

    return gmtDateTime.local().format("DD-MMM-YYYY hh:mm A");
  }

  static DateAndHours(date) {
    if (!date) {
      return null
    }
    const timestamp = new Date(date);
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formattedTimestamp = timestamp.toLocaleString("en-IN", options);
    return formattedTimestamp
  }

  static getSchedulerTime() {
    let Interval = [];
    const IntervalInHour = [];
    const IntervalInMin = [
      { value: 1, label: "1 Min" },
      { value: 5, label: "5 Min" },
      { value: 15, label: "15 Min" },
      { value: 30, label: "30 Min" }
    ];
    for (let i = 1; i <= 24; i++) {
      IntervalInHour.push({
        value: 60 * i,
        label: `${i} Hour`
      });
    }
    Interval = IntervalInMin.concat(IntervalInHour);

    return Interval;
  };

  static DateUpdate(selectedDate, convertionDate) {
    try {
      if (selectedDate instanceof Date && convertionDate instanceof Date) {

        let date = selectedDate.getDate();
        let month = selectedDate.getMonth();
        let year = selectedDate.getFullYear();

        if (date && month && year) {
          convertionDate.toString();
          convertionDate.setDate(date);
          convertionDate.setMonth(month);
          convertionDate.setFullYear(year);
        }
      }
      return convertionDate;
    } catch (err) {
      console.log(err);
    }
  }

  static TimeUpdate(selectedDateTime, convertionDate) {
    try {
      if (selectedDateTime instanceof Date && convertionDate instanceof Date) {

        let date = convertionDate.getDate();
        let month = convertionDate.getMonth();
        let year = convertionDate.getFullYear();

        if (date && month && year) {
          selectedDateTime.toString();
          selectedDateTime.setDate(date);
          selectedDateTime.setMonth(month);
          selectedDateTime.setFullYear(year);
        }
      }
      return selectedDateTime;
    } catch (err) {
      console.log(err);
    }
  }

  static CurrentStartMonth() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const startDate = new Date(currentYear, currentMonth, 1);

    return this.formatDate(startDate);
  }
  static CurrentEndMonth() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const endDate = new Date(currentYear, currentMonth + 1, 0);

    return this.formatDate(endDate);
  }

  static compareTime(startTime, endTime) {
    try {

      let currentDate = new Date();

      startTime = new Date(Date.parse(startTime));

      endTime = new Date(Date.parse(endTime));

      if (startTime instanceof Date && endTime instanceof Date) {

        let startTimeHour = startTime.getHours();
        let startTimeMinute = startTime.getMinutes();
        let startTimeSeconds = endTime.getSeconds();

        let endTimeHour = endTime.getHours();
        let endTimeMinute = endTime.getMinutes();
        let endTimeSeconds = endTime.getSeconds();

        let currentTimeHour = currentDate.getHours();
        let currentTimeMinutes = currentDate.getMinutes();
        let currentTimeSeconds = currentDate.getMinutes();

        let hourValidation = currentTimeHour >= startTimeHour && currentTimeHour <= endTimeHour;

        let minuteValidation = startTimeMinute > 0 && endTimeMinute > 0 ? currentTimeMinutes >= startTimeMinute && currentTimeMinutes <= endTimeMinute : true;

        let secondValidation = startTimeSeconds > 0 && endTimeSeconds > 0 ? currentTimeSeconds >= startTimeSeconds && currentTimeSeconds <= endTimeSeconds : true;

        return hourValidation && minuteValidation && secondValidation ? true : false;

      }
    } catch (err) {
      console.log(err);
    }
  }

  static formattedfDate(date, format) {
    return moment(date).format(format);
  }

  static TimeNow(date) {
    if (!date) {
      return null;
    }
    return moment(date).fromNow();
  }

  static getTimeInSeconds(startDate, endDate) {
    if (!startDate || !endDate) {
      return null;
    }
    let timeDifference = Math.floor((startDate.getTime() - endDate.getTime()) / 1000);


    return timeDifference;
  }

  static getCurrentDate(format) {
    return this.formattedfDate(new Date(), format);
  }

  static getDate(dateString) {
    console.debug("DateTime ~ dateString--------------->>>", moment(dateString, moment.ISO_8601).toDate());
    return moment(dateString, moment.ISO_8601).toDate();
}



static Today (date)  {
  try{
    if (date && date !== "undefined" && date !== undefined && date !=="" && date !=="null") {
  return new Date(date);
    }else{
      return new Date();
    }
  }catch(err){
    console.log(err);
  }
}
static getYears() {

  const yearOption = [];
  for (let i = 2010; i <= 2030; i++) {
    yearOption.push({
      label: i,
      value: i,
    });
  }
  return yearOption;
}

static getMonths() {
  const MonthOption = [
    { label: "January", value: 1 },
    { label: "February", value: 2 },
    { label: "March", value: 3 },
    { label: "April", value: 4 },
    { label: "May", value: 5 },
    { label: "June", value: 6 },
    { label: "July", value: 7 },
    { label: "August", value: 8 },
    { label: "September", value: 9 },
    { label: "October", value: 10 },
    { label: "November", value: 11 },
    { label: "December", value: 12 },
  ];


  return MonthOption;
}

static compareTimeByMinutes(startDate, minutes){
  try{
  if(startDate && minutes){
  const currentDate = new Date();
  const createdAtDate = new Date(startDate);
  const diffInMinutes = (currentDate - createdAtDate) / (1000 * 60);
  return diffInMinutes >= minutes;
  }else{
    return null
  }
}catch(err){
  console.log(err);
}
}
static todayDateOnly ()  {
  try{
    const today = new Date();

    return today.toISOString().split('T')[0]; 
  }catch(err){
    console.log(err);
  }
}
}

export default DateTime;
