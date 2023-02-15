function getMysqlDateTime(milisecondsToAdd = 0) {
  var today = new Date(Date.now() + milisecondsToAdd);
  //var date = today.getDate() + ". " + (today.getMonth() + 1) + ". " + today.getFullYear();
  var date =
    today.getUTCFullYear() +
    "-" +
    (today.getUTCMonth() + 1) +
    "-" +
    today.getUTCDate();
  var time =
    today.getUTCHours() +
    ":" +
    today.getUTCMinutes() +
    ":" +
    today.getUTCSeconds();
  var dateTime = date + " " + time;
  return dateTime;
}

export default getMysqlDateTime;
