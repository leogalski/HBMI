"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Frameworks
var app = require('express')();
var fs = require("fs");
// Allow local http requests for testing
var cors = require('cors');
app.use(cors({ origin: 'http://127.0.0.1:3000' }));
// Constants
var PORT = 8080;
var LOGDIR = 'log/';
// Retrieve latest log file from directory
var fetchLatestLogFile = function () {
    var fileDates = [];
    var logFile;
    // Sort all files alphabetically, reverse it, and [0] will be the latest date
    fs.readdirSync(LOGDIR).forEach(function (value) {
        fileDates.push((value.split('_')[2]).split('.')[0]);
    });
    fileDates.sort().reverse();
    // Find the actual latest log...
    fs.readdirSync(LOGDIR).forEach(function (value) {
        if (value.includes(fileDates[0])) {
            logFile = value;
        }
    });
    // ...and return it
    return fs.readFileSync("".concat(LOGDIR).concat(logFile), 'utf8');
};
var latestLogFile = fetchLatestLogFile();
// Retrieve list of companies (databases) - Returns an ARRAY
var retrieveCompanies = function () {
    var latestLog = latestLogFile.split(/\r?\n/);
    return new Promise(function (resolve, reject) {
        var companiesList = [];
        latestLog.forEach(function (value, index) {
            if (value.includes('List of schemas which will be backed up:')) {
                companiesList = latestLog[index + 1].split(' | ')[1].split(' ');
            }
        });
        resolve(companiesList);
    });
};
// Retrieve disk information - Returns an ARRAY OF OBJECTS (one object per mounting point / partition)
var retrieveDisks = function () {
    var latestLog = latestLogFile.split(/\r?\n/);
    return new Promise(function (resolve, reject) {
        var disks = [{}];
        disks.shift();
        var availableSpaceBefore;
        var availableSpaceAfter;
        var availableSpace;
        latestLog.forEach(function (value, index) {
            if (value.includes('Disk space after backup:')) {
                availableSpaceBefore = index + 3;
            }
            else if (value.includes('Files on destination directory after the backup:')) {
                availableSpaceAfter = index - 2;
            }
        });
        for (var i = availableSpaceBefore; i < availableSpaceAfter; i++) {
            var diskInfo = (latestLog[i].replace(/\s+/g, ' ')).split(' ');
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
    });
};
// Retrieve log files from directory - Returns an ARRAY
var retrieveAllLogFiles = function () {
    return new Promise(function (resolve, reject) {
        resolve(fs.readdirSync(LOGDIR));
    });
};
// Retrieve latest log files (maximum 10) - Returns an ARRAY OF OBJECTS (one object per log type [daily, weekly, monthly])
var retrieveLatestLogFiles = function () {
    var filesDaily = [];
    var filesWeekly = [];
    var filesMonthly = [];
    var latestFilesDaily = [];
    var latestFilesWeekly = [];
    var latestFilesMonthly = [];
    // Split each log category...
    fs.readdirSync(LOGDIR).forEach(function (value) {
        if (value.includes('daily')) {
            filesDaily.push(value);
        }
        else if (value.includes('weekly')) {
            filesWeekly.push(value);
        }
        else if (value.includes('monthly')) {
            filesMonthly.push(value);
        }
    });
    // ...and sort them
    filesDaily.sort().reverse();
    filesWeekly.sort().reverse();
    filesMonthly.sort().reverse();
    for (var index = 0; index < 10; index++) {
        if (typeof filesDaily[index] != 'undefined') {
            latestFilesDaily.push(filesDaily[index]);
        }
        if (typeof filesWeekly[index] != 'undefined') {
            latestFilesWeekly.push(filesWeekly[index]);
        }
        if (typeof filesMonthly[index] != 'undefined') {
            latestFilesMonthly.push(filesMonthly[index]);
        }
    }
    // Generate and return the array of objects
    return new Promise(function (resolve, reject) {
        var latestLogFiles = [{}];
        latestLogFiles.shift();
        latestLogFiles.push({
            logType: 'daily',
            logFiles: latestFilesDaily
        });
        latestLogFiles.push({
            logType: 'weekly',
            logFiles: latestFilesWeekly
        });
        latestLogFiles.push({
            logType: 'monthly',
            logFiles: latestFilesMonthly
        });
        resolve(latestLogFiles);
    });
};
// API listener
app.listen(PORT, function () { return console.log("API started on port ".concat(PORT)); });
// URIs for each information retrieval
app.get('/api/getCompanies', function (req, res) {
    retrieveCompanies().then(function (response) {
        res.status(200).send(response);
    });
});
//
app.get('/api/getDisks', function (req, res) {
    retrieveDisks().then(function (response) {
        res.status(200).send(response);
    });
});
//
app.get('/api/getAllLogFiles', function (req, res) {
    retrieveAllLogFiles().then(function (response) {
        res.status(200).send(response);
    });
});
//
app.get('/api/getLatestLogFiles', function (req, res) {
    retrieveLatestLogFiles().then(function (response) {
        res.status(200).send(response);
    });
});
