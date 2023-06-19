fetch('http://localhost:8080/api/getDisks')
.then(response => response.json())
.then(function(json) {
    let div = `
        <table>
            <tr>
                <th>Filesystem</th>
                <th>Mounted On</th>
                <th>Disk Space</th>
            </tr>`;
    json.map(function(disk) {
        let diskSpaceUsed = (disk.usedPercentage)
        .substring(0,disk.usedPercentage.length-1);
        let diskSpaceBarUsed = diskSpaceUsed * 2;
        div += `
        <tr>
            <td>${disk.filesystem}</td>
            <td>${disk.mountedOn}</td>
            <td>
                <div class = 'diskSpaceBar'>
                    <span class = 'tooltip'>
                        ${disk.mountedOn}<br>
                        ${disk.size}B total size<br>
                        ${disk.used}B used <br>
                        ${disk.available}B available <br>
                        ${diskSpaceUsed}% used
                    </span>
                    <div class = 'diskSpaceBarUsed'
                    style = 'width: ${diskSpaceBarUsed}px'></div>
                </div>
            </td>
        </tr>`;
    })
    div += `</table>`;
    document.getElementById('tableDiv').innerHTML = div;
})

fetch('http://localhost:8080/api/getLatestLogFiles')
.then(response => response.json())
.then(function(json) {
    json.map(function(fileType) {
        let div = document.getElementById(`${fileType.logType}LogsDiv`);
        console.log(`${fileType}LogsDiv`);
        div.innerHTML += `<h4> Latest ${fileType.logType} SAP HANA backup logs</h4>`
        fileType.logFiles.forEach(function(logFile) {
            div.innerHTML += `
            <a href = '#' onclick = "showLogFileContents('${logFile}')">
            ${logFile}</a><br>`;
        })
    })
})

const showLogFileContents = (logFile) => {
    response = fetch(`http://localhost:8080/api/getLogFileContents?logFile=${logFile}`)
    .then(response => response.text())
    .then(logContents => { 
        document.getElementById('logFileContents').innerHTML = logContents;
        document.getElementById('logFileContentsDiv').style.display = 'block';
    });
}

const hideLogFileContents = () => {
    document.getElementById('logFileContentsDiv').style.display = 'none';
}