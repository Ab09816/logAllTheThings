const { isUtf8 } = require('buffer');
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;


// Create a CSV writer stream
const { createObjectCsvWriter } = require('csv-writer');
const csvWriter = createObjectCsvWriter({
    path: 'log.csv', // Point to the existing log.csv file
    header: [
        { id: 'Agent', title: 'Agent' },
        { id: 'Time', title: 'Time' },
        { id: 'Method', title: 'Method' },
        { id: 'Resource', title: 'Resource' },
        { id: 'Version', title: 'Version' },
        { id: 'Status', title: 'Status' }
    ]
});

// Middleware to log requests to CSV file
app.use((req, res, next) => {
   
    const agent = req.headers['user-agent']; // extracts the user-agent string from the request header
    const time = new Date().toISOString(); // The ISO format is a standard way of representing dates and times in a string 
    const method = req.method; // retrieves the HTTP method used in the request (GET, POST, PUT, etc.) using req.method and assigns it to the variable method
    const resource = req.url; // gets the requested resource URL
    const version = req.httpVersion; // retrieves the HTTP version of the request
    const status = res.statusCode; // gets the status code of the response
    

    console.log(`${agent},${time},${method},${resource},HTTP/${version}, Status: ${status}`);

    // write the data in log.csv
    csvWriter.writeRecords([
        { Agent: agent, Time: time, Method: method, Resource: resource, Version: version, Status: status },
        { Time: time, Agent: agent, Method: method, Resource: resource, Version: version, Status: status },
        { Method: method, Agent: agent, Time: time, Resource: resource, Version: version, Status: status },
        { Resource: resource, Agent: agent, Time: time, Method: method, Version: version, Status: status },
        { Version: version, Agent: agent, Time: time, Method: method, Resource: resource, Status: status }
    ])
    .then(() => {
        console.log('Data written to log.csv');
    })
    .catch((error) => {
        console.error('Error writing data to log.csv:', error);
    });

    next();
});

app.get('/', (req, res) => {
    // write your code to respond "ok" here
    res.status(200).send('ok');
});

// Endpoint to return a JSON object with all log data
app.get('/logs', (req, res) => {
    const logs = fs.readFileSync('log.csv', 'utf8');
    res.json(logs.split('\n').map(line => {
        const [Agent, Time, Method, Resource, Version, Status] = line.split(',');
        return { Agent, Time, Method, Resource, Version, Status };
    }));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});

module.exports = app;
