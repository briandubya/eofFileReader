function processFile() {
    const selection = document.querySelector('input[name="dataSelection"]:checked').value;
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert("Please upload a file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split('\n');
        processData(lines, selection);
        extractChannelData(lines)
    };
    reader.readAsText(file);
}

function processData(lines, selection) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // clear any existing data

    // Find the start line containing the Velocity, Flow Rate or Head
    let startLine;
    if (selection == "velocity"){
        startLine = lines.findIndex(line => line.includes("MAXIMUM AND MINIMUM VELOCITIES (m/s)"));
    } else if (selection == "flow"){
        startLine = lines.findIndex(line => line.includes("MAXIMUM AND MINIMUM VOLUME FLOWS,   CU.M/S"));
    }
    
    if (startLine === -1 || startLine + 5 >= lines.length) {
        outputElement.textContent = 'Required data not found or insufficient data after the start line.';
        return;
    }
    startLine += 2; // Skip the blank line after the target line

    // Extract and process the necessary lines
    const channels = lines[startLine].trim().split(/\s+/).slice(1);
    const timeMins = lines[startLine + 3].trim().split(/\s+/).slice(1);
    const minimums = lines[startLine + 2].trim().split(/\s+/).slice(1).map(cleanValue);
    const timeMaxs = lines[startLine + 6].trim().split(/\s+/).slice(1);
    const maximums = lines[startLine + 5].trim().split(/\s+/).slice(1).map(cleanValue);

    for (let i = 0; i < channels.length; i++) {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = channels[i];
        row.insertCell(1).textContent = timeMins[i];
        row.insertCell(2).textContent = minimums[i];
        row.insertCell(3).textContent = timeMaxs[i];
        row.insertCell(4).textContent = maximums[i];
    }
}

// Removes any non-numerical characters from a string and converts it to a float
function cleanValue(value) {
    return parseFloat(value.replace(/[^\d.-]/g, ''));
}

// Extracts the channel data from the eof file
function extractChannelData(lines) {
    // const lines = text.split('\n');
    let channelDataStarted = false;
    const channelData = [];
    let lineBreakCount = 0;

    for (const line of lines) {
        if (line.trim().startsWith('CHANNEL DATA')) {
            channelDataStarted = true;
            continue;
        }

        if (channelDataStarted) {
            if (line.trim() === '') {
                lineBreakCount++;
                if (lineBreakCount > 2) break; // Stop if it's the line break after the data
                continue; // Skip the line break after the column names
            }

            const columns = line.trim().split(/\s+/);
            const channelDatum = {
                number: columns[0],
                channel: columns[1],
                usNode: columns[2],
                dsNode: columns[3],
                flags: columns[4],
                length: columns[5],
                formLoss: columns[6],
                nOrCd: columns[7],
                initVel: columns[8],
                usBedLevels: columns[9],
                dsBedLevels: columns[10],
                blockage: columns[11]
            };
            channelData.push(channelDatum);
        }
    }


    for (let i = 1; i < channelData.length; i++) {
        const row = channelBody.insertRow();
        row.insertCell(0).textContent = channelData[i].number;
        row.insertCell(1).textContent = channelData[i].channel;
        row.insertCell(2).textContent = channelData[i].usNode;
        row.insertCell(3).textContent = channelData[i].dsNode;
        row.insertCell(4).textContent = channelData[i].flags;
        row.insertCell(5).textContent = channelData[i].length;
        row.insertCell(6).textContent = channelData[i].formLoss;
        row.insertCell(7).textContent = channelData[i].nOrCd;
        row.insertCell(8).textContent = channelData[i].initVel;
        row.insertCell(9).textContent = channelData[i].usBedLevels;
        row.insertCell(10).textContent = channelData[i].dsBedLevels;
        row.insertCell(11).textContent = channelData[i].blockage;
    }

    // console.log(channelData[1]);
}

// Clear the table 
function clearTable() {
    document.getElementById('tableBody').innerHTML = '';
}

// Function to search the table
function searchTable() {
    const input = document.getElementById("searchInput");
    const filter = input.value.toUpperCase();
    const table = document.getElementById("outputTable");
    const tbody = table.getElementsByTagName("tbody")[0];
    const rows = tbody.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        if (row) {
            let text = row.textContent || row.innerText;
            if (text.toUpperCase().indexOf(filter) > -1) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    }
}