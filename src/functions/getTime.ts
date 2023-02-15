function getTime() {
  var today = new Date();
  var date =
    today.getUTCDate() +
    ". " +
    (today.getUTCMonth() + 1) +
    ". " +
    today.getUTCFullYear();
  var time =
    today.getUTCHours() +
    ":" +
    today.getUTCMinutes() +
    ":" +
    today.getUTCSeconds();
  var dateTime = "[" + date + " " + time + "]";
  return dateTime;
}

export default getTime;
