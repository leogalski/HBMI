// Frameworks
const app = require('express')();
import { log } from 'console';
import * as fs from 'fs';

// Allow local http requests for testing
const cors = require('cors');
app.use(cors({origin: 'http://127.0.0.1:3000'}));

// Constants
const PORT = 8080;
const LOGDIR = 'log/';

// Retrieve latest log file from directory
const retrieveLatestLogFile = () => {
    let fileDates = [];
    let logFile;

    // Sort all files alphabetically, reverse it, and [0] will be the latest date
    fs.readdirSync(LOGDIR).forEach(function(value) {
        fileDates.push((value.split('_')[2]).split('.')[0]);
    })
    fileDates.sort().reverse();

    // Find the actual latest log...
    fs.readdirSync(LOGDIR).forEach(function(value) {
        if (value.includes(fileDates[0])) {
            logFile = value;            
        }
    })
    
    // ...and return it
    return fs.readFileSync(`${LOGDIR}${logFile}`, 'utf8');
}
var latestLogFile = retrieveLatestLogFile();

// Retrieve list of companies (databases) - Returns an ARRAY
const retrieveCompanies = () => {
    let latestLog = latestLogFile.split(/\r?\n/);
    
    return new Promise((resolve, reject) => {
        let companiesList = [];
        latestLog.forEach(function(value, index) {
            if (value.includes('List of schemas which will be backed up:')) {
                companiesList = latestLog[index + 1].split(' | ')[1].split(' ');
            }
        });
        resolve(companiesList);
    })
}

// Retrieve disk information - Returns an ARRAY OF OBJECTS (one object per mounting point / partition)
const retrieveDisks = () => {
    let latestLog = latestLogFile.split(/\r?\n/);
    return new Promise((resolve, reject) => {
        let disks = [{}];
        disks.shift();
        let availableSpaceBefore;
        let availableSpaceAfter;
        let availableSpace;
        latestLog.forEach(function(value, index){
            if (value.includes('Disk space after backup:')) {
                availableSpaceBefore = index + 3;
            } else if (value.includes('Files on destination directory after the backup:')) {
                availableSpaceAfter = index - 2;
            }
        });
        for (let i = availableSpaceBefore; i < availableSpaceAfter; i++) {
            let diskInfo = (latestLog[i].replace(/\s+/g,' ')).split(' ');
            if (!diskInfo[0].includes('tmpfs')) {    
                disks.push({
                    'filesystem': diskInfo[0],
                    'size': diskInfo[1],
                    'used': diskInfo[2],
                    'available': diskInfo[3],
                    'usedPercentage': diskInfo[4],
                    'mountedOn': diskInfo[5]   
                });
            }
        }
        resolve(disks);
    })
}

// Retrieve log files from directory - Returns an ARRAY
const retrieveAllLogFiles = () => {
    return new Promise((resolve, reject) => {
        resolve(fs.readdirSync(LOGDIR));
    }  
)} 

// Retrieve latest log files (maximum 10) - Returns an ARRAY OF OBJECTS (one object per log type [daily, weekly, monthly])
const retrieveLatestLogFiles = () => {
    let filesDaily = [];
    let filesWeekly = [];
    let filesMonthly = [];
    let latestFilesDaily = [];
    let latestFilesWeekly = [];
    let latestFilesMonthly = [];

    // Split each log category...
    fs.readdirSync(LOGDIR).forEach(function(value) {
        if (value.includes('daily')) {
            filesDaily.push(value);
        } else if (value.includes('weekly')) {
            filesWeekly.push(value);
        } else if (value.includes('monthly')) {
            filesMonthly.push(value);
        }
    })

    // ...and sort them
    filesDaily.sort().reverse();
    filesWeekly.sort().reverse();
    filesMonthly.sort().reverse();

    for (let index = 0; index < 10; index++) {
        if (typeof filesDaily[index] != 'undefined') {
            latestFilesDaily.push(filesDaily[index]);
        } if (typeof filesWeekly[index] != 'undefined') {
            latestFilesWeekly.push(filesWeekly[index]);
        } if (typeof filesMonthly[index] != 'undefined') {
            latestFilesMonthly.push(filesMonthly[index]);
        }
    }

    // Generate and return the array of objects
    return new Promise((resolve, reject) => {
        let latestLogFiles = [{}];
        latestLogFiles.shift();
        latestLogFiles.push ({
            logType: 'daily',
            logFiles: latestFilesDaily
        });
        latestLogFiles.push ({
            logType: 'weekly',
            logFiles: latestFilesWeekly
        });
        latestLogFiles.push ({
            logType: 'monthly',
            logFiles: latestFilesMonthly
        });
        resolve(latestLogFiles);
    })
}

const retrieveLogFileContents = (logFile) => {
    return new Promise((resolve, reject) => {
        resolve (fs.readFileSync(`${LOGDIR}${logFile}`, 'utf8'));
    })
}

// API listener
app.listen(PORT, () => console.log(`API started on port ${PORT}`))

// URIs for each information retrieval
app.get('/api/getCompanies', (req, res) => {
    retrieveCompanies().then(function(response){
        res.status(200).send(
            response
        )
    })
});
//
app.get('/api/getDisks', (req, res) => {
    retrieveDisks().then(function(response){
        res.status(200).send(
            response
        )
    })
});
//
app.get('/api/getAllLogFiles', (req, res) => {
    retrieveAllLogFiles().then(function(response){
        res.status(200).send(
            response
        )
    })
});
//
app.get('/api/getLatestLogFiles', (req, res) => {
    retrieveLatestLogFiles().then(function(response){
        res.status(200).send(
            response
        )
    })
});
//
app.get('/api/getLogFileContents', (req, res) => {
    let logFile = req.query.logFile;
    retrieveLogFileContents(logFile).then(function(response){
        res.status(200).send(
            response
        )
    })
});