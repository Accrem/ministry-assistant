// Timer variables
let startTime, interval;

// DOM Elements
const timerElement = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const resetButton = document.getElementById('resetButton');
const savedTimesBody = document.getElementById('savedTimesBody');

// Start Timer
startButton.addEventListener('click', () => {
    startTime = Date.now();
    interval = setInterval(updateTimer, 1000);
    startButton.classList.add('hidden');
    stopButton.classList.remove('hidden');
});

// Stop Timer
stopButton.addEventListener('click', () => {
    clearInterval(interval);
    const elapsedTime = Date.now() - startTime;
    const formattedTime = formatTime(elapsedTime);
    saveTimeToFirestore(formattedTime);
    startButton.classList.remove('hidden');
    stopButton.classList.add('hidden');
});

// Reset Timer
resetButton.addEventListener('click', () => {
    clearInterval(interval);
    timerElement.textContent = '00:00:00';
    startButton.classList.remove('hidden');
    stopButton.classList.add('hidden');
});

// Update Timer Display
function updateTimer() {
    const elapsedTime = Date.now() - startTime;
    timerElement.textContent = formatTime(elapsedTime);
}

// Format time as hh:mm:ss
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Save Time to Firestore
function saveTimeToFirestore(time) {
    const now = new Date();
    db.collection('savedTimes').add({
        time: time,
        date: now.toISOString(),
    })
    .then(docRef => {
        console.log("Time saved with ID: ", docRef.id);
        appendTimeToTable(time, now);
    })
    .catch(error => {
        console.error("Error adding document: ", error);
    });
}

// Append Time to the Table in the DOM
function appendTimeToTable(time, date) {
    const row = document.createElement('tr');
    const timeCell = document.createElement('td');
    const dateCell = document.createElement('td');
    
    timeCell.textContent = time;
    dateCell.textContent = date.toLocaleString();

    row.appendChild(timeCell);
    row.appendChild(dateCell);
    savedTimesBody.appendChild(row);
}

// Load Saved Times from Firestore on Page Load
function loadSavedTimes() {
    db.collection('savedTimes').orderBy('date', 'desc').get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
            const data = doc.data();
            appendTimeToTable(data.time, new Date(data.date));
        });
    });
}

// Load saved times when the page loads
window.onload = loadSavedTimes;
