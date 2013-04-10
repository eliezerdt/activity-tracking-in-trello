function success(result, status, xhr) {
  // result = object parsed JSON data, text, or Blob.
  // status = result status (same as xhr.status)
  // xhr = plain XMLHttpRequest

}
function error(result, status, xhr) {
  // result = object parsed JSON data (if parsable) or text.
  // status = result status (same as xhr.status)
  // xhr = plain XMLHttpRequest or empty object (only authorize failed).
}