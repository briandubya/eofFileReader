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