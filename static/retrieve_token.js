const dataToBeSent = { tooltips: localStorage.getItem('tooltips') || 'true' };

fetch('/receive_data', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToBeSent),
})
    .then(response => response.json())
    .then(data => {
        // Handle success
        console.log(data);
    })
    .catch(error => {
        // Handle error
        console.error('Error sending data:', error);
    });

localStorage.setItem('tooltips', false);