const WORKER_COUNT = 100;
const workers = [];
let chartInstance = null;

// DOM Elements
const grid = document.getElementById('worker-grid');
const logContainer = document.getElementById('log-container');
const scoreEl = document.getElementById('safety-score');
const totalEl = document.getElementById('count-total');
const normalEl = document.getElementById('count-normal');
const warningEl = document.getElementById('count-warning');
const dangerEl = document.getElementById('count-danger');
const clockEl = document.getElementById('clock');
const modal = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalName = document.getElementById('modal-worker-name');

// Names pool
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'Robert', 'Sophia', 'William', 'Isabella', 'Joseph', 'Mia', 'Charles'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson'];

function generateName() {
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

// Initialize Workers
function initWorkers() {
    for (let i = 1; i <= WORKER_COUNT; i++) {
        workers.push({
            id: `W-${i.toString().padStart(3, '0')}`,
            name: generateName(),
            hr: Math.floor(Math.random() * 30) + 65, // 65 ~ 95
            temp: (Math.random() * 1.0 + 36.0).toFixed(1), // 36.0 ~ 37.0
            status: 'normal',
            historyHR: Array.from({length: 60}, () => Math.floor(Math.random() * 20) + 70),
            historyTemp: Array.from({length: 60}, () => (Math.random() * 0.8 + 36.2).toFixed(1))
        });
    }
}

// Determine Status
function getStatus(hr, temp) {
    const t = parseFloat(temp);
    if (hr > 120 || t > 38.0) return 'danger';
    if (hr >= 100 || t >= 37.5) return 'warning';
    return 'normal';
}

// Update clock
function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

// Add Event Log
function addLog(worker, oldStatus, newStatus) {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const logItem = document.createElement('div');
    logItem.className = `log-item log-${newStatus}`;
    
    let msg = '';
    if (newStatus === 'danger') {
        msg = `CRITICAL ALERT: <span class="worker-ref">${worker.id} (${worker.name})</span> shows abnormal vitals (HR: ${worker.hr}, Temp: ${worker.temp}°C). Immediate action required.`;
    } else if (newStatus === 'warning') {
        msg = `WARNING: <span class="worker-ref">${worker.id} (${worker.name})</span> vitals are elevated (HR: ${worker.hr}, Temp: ${worker.temp}°C).`;
    } else {
        msg = `RESOLVED: <span class="worker-ref">${worker.id} (${worker.name})</span> returned to normal parameters.`;
    }

    logItem.innerHTML = `
        <span class="log-time">${time}</span>
        <div class="log-message">${msg}</div>
    `;
    
    logContainer.prepend(logItem);
    
    // Keep max 50 logs
    if (logContainer.children.length > 50) {
        logContainer.removeChild(logContainer.lastChild);
    }
}

// Simulation Tick
function simulate() {
    let stats = { normal: 0, warning: 0, danger: 0 };
    
    workers.forEach(w => {
        // Random slight variations
        if (Math.random() > 0.7) {
            let hrDelta = Math.floor(Math.random() * 5) - 2;
            let tempDelta = (Math.random() * 0.2 - 0.1);
            
            // Random chance of big spike
            if (Math.random() > 0.98) {
                hrDelta += Math.floor(Math.random() * 40); // Big spike
                tempDelta += Math.random() * 1.5;
            }
            // Random chance of recovery if high
            if (w.hr > 100 && Math.random() > 0.5) {
                hrDelta -= 15;
            }
            if (parseFloat(w.temp) > 37.5 && Math.random() > 0.5) {
                tempDelta -= 0.5;
            }

            w.hr = Math.max(50, Math.min(180, w.hr + hrDelta));
            w.temp = Math.max(35.0, Math.min(41.0, parseFloat(w.temp) + tempDelta)).toFixed(1);
            
            w.historyHR.shift();
            w.historyHR.push(w.hr);
            w.historyTemp.shift();
            w.historyTemp.push(parseFloat(w.temp));
        }

        const newStatus = getStatus(w.hr, w.temp);
        
        if (newStatus !== w.status) {
            // Only log if moving to a worse state or fully recovered from danger
            if ((newStatus === 'danger') || 
                (newStatus === 'warning' && w.status === 'normal') ||
                (newStatus === 'normal' && w.status === 'danger')) {
                addLog(w, w.status, newStatus);
            }
            w.status = newStatus;
        }
        
        stats[w.status]++;
    });

    // Update Header
    totalEl.textContent = workers.length;
    normalEl.textContent = stats.normal;
    warningEl.textContent = stats.warning;
    dangerEl.textContent = stats.danger;
    
    const safetyPercent = Math.round((stats.normal / workers.length) * 100);
    scoreEl.textContent = `${safetyPercent}%`;

    renderGrid();
}

// Render Grid
function renderGrid() {
    // Sort logic: danger -> warning -> normal
    const sorted = [...workers].sort((a, b) => {
        const order = { 'danger': 0, 'warning': 1, 'normal': 2 };
        if (order[a.status] !== order[b.status]) {
            return order[a.status] - order[b.status];
        }
        return a.id.localeCompare(b.id);
    });

    grid.innerHTML = ''; // Clear
    
    sorted.forEach(w => {
        const card = document.createElement('div');
        card.className = `worker-card status-${w.status}`;
        card.onclick = () => openModal(w);
        
        card.innerHTML = `
            <div class="card-header">
                <span class="worker-id">${w.id}</span>
                <span class="worker-name">${w.name}</span>
            </div>
            <div class="card-data">
                <div class="data-item">
                    <span class="data-label">HR (bpm)</span>
                    <span class="data-value">${w.hr}</span>
                </div>
                <div class="data-item" style="text-align: right;">
                    <span class="data-label">TEMP (°C)</span>
                    <span class="data-value">${w.temp}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Modal & Chart Logic
function openModal(worker) {
    modalName.textContent = `${worker.id} - ${worker.name}`;
    modal.classList.add('active');
    
    const ctx = document.getElementById('detail-chart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const labels = Array.from({length: 60}, (_, i) => `-${60 - i}m`);
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Heart Rate (bpm)',
                    data: worker.historyHR,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Temperature (°C)',
                    data: worker.historyTemp,
                    borderColor: '#facc15',
                    backgroundColor: 'rgba(250, 204, 21, 0.1)',
                    yAxisID: 'y1',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: 50,
                    max: 200,
                    grid: { color: '#334155' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 35.0,
                    max: 42.0,
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

modalClose.addEventListener('click', () => {
    modal.classList.remove('active');
});

// Init
initWorkers();
simulate(); // Initial render
setInterval(simulate, 2000); // Update every 2 seconds
