// Assume you have some data stored in local storage
const dataToBeSent = { tooltips: localStorage.getItem('tooltips') || 'true' };

// Use AJAX to send the data to the Flask server
let xhr = new XMLHttpRequest();
xhr.open('POST', '/receive_data', true);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send(JSON.stringify(dataToBeSent));
localStorage.setItem('tooltips', false);