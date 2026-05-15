class DigitalClock {
    constructor() {
        this.clocks = [];
        this.is24Hour = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadClocks();
        this.updateAllClocks();
        setInterval(() => this.updateAllClocks(), 1000);
    }

    setupEventListeners() {
        document.getElementById('add-btn').addEventListener('click', () => this.addClock());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());
        document.getElementById('format-toggle').addEventListener('change', (e) => this.toggleFormat(e));
        document.getElementById('timezone-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.addClockByTimezone(e.target.value);
                e.target.value = '';
            }
        });
    }

    addClockByTimezone(timezone) {
        if (this.clocks.some(clock => clock.timezone === timezone)) {
            alert('This timezone is already added!');
            return;
        }
        this.clocks.push({ timezone });
        this.saveClocks();
        this.render();
    }

    addClock() {
        const select = document.getElementById('timezone-select');
        if (select.value) {
            this.addClockByTimezone(select.value);
            select.value = '';
        } else {
            alert('Please select a timezone first!');
        }
    }

    removeClock(index) {
        this.clocks.splice(index, 1);
        this.saveClocks();
        this.render();
    }

    clearAll() {
        if (this.clocks.length === 0) {
            alert('No clocks to clear!');
            return;
        }
        if (confirm('Are you sure you want to remove all clocks?')) {
            this.clocks = [];
            this.saveClocks();
            this.render();
        }
    }

    toggleFormat(e) {
        this.is24Hour = e.target.checked;
        document.getElementById('format-display').textContent = this.is24Hour ? '24-Hour' : '12-Hour';
        this.updateAllClocks();
    }

    getTimeForTimezone(timezone) {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !this.is24Hour,
            timeZone: timezone
        });
        return formatter.format(now);
    }

    getDateForTimezone(timezone) {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: timezone
        });
        return formatter.format(now);
    }

    getUTCOffset(timezone) {
        try {
            const now = new Date();
            const utcString = now.toLocaleString('en-US', { timeZone: 'UTC' });
            const tzString = now.toLocaleString('en-US', { timeZone: timezone });
            
            const utcDate = new Date(utcString);
            const tzDate = new Date(tzString);
            
            const offset = (tzDate - utcDate) / (1000 * 60 * 60);
            const sign = offset >= 0 ? '+' : '';
            return `UTC ${sign}${offset.toFixed(1)}`;
        } catch (e) {
            return 'UTC';
        }
    }

    updateAllClocks() {
        this.clocks.forEach((clock, index) => {
            const clockElement = document.querySelector(`[data-index="${index}"] .digital-time`);
            if (clockElement) {
                clockElement.textContent = this.getTimeForTimezone(clock.timezone);
            }
        });
    }

    render() {
        const container = document.getElementById('clocks-container');
        container.innerHTML = '';

        if (this.clocks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📍 No clocks added yet</p>
                    <p style="font-size: 0.9em;">Select a timezone above and click "+ Add" to get started!</p>
                </div>
            `;
            document.getElementById('clock-count').textContent = '0';
            return;
        }

        this.clocks.forEach((clock, index) => {
            const time = this.getTimeForTimezone(clock.timezone);
            const date = this.getDateForTimezone(clock.timezone);
            const offset = this.getUTCOffset(clock.timezone);
            const timezoneDisplay = clock.timezone.replace(/_/g, ' ').split('/').pop();

            const clockCard = document.createElement('div');
            clockCard.className = 'clock-card';
            clockCard.setAttribute('data-index', index);
            clockCard.innerHTML = `
                <button class="remove-btn" onclick="clock.removeClock(${index})">×</button>
                <div class="timezone-name">${timezoneDisplay}</div>
                <div class="digital-time">${time}</div>
                <div class="date-display">${date}</div>
                <div class="offset-info">${offset}</div>
            `;
            container.appendChild(clockCard);
        });

        document.getElementById('clock-count').textContent = this.clocks.length;
    }

    saveClocks() {
        localStorage.setItem('clocks', JSON.stringify(this.clocks));
    }

    loadClocks() {
        const saved = localStorage.getItem('clocks');
        if (saved) {
            this.clocks = JSON.parse(saved);
        } else {
            // Add default clocks
            this.clocks = [
                { timezone: 'UTC' },
                { timezone: 'America/New_York' },
                { timezone: 'Asia/Tokyo' }
            ];
            this.saveClocks();
        }
        this.render();
    }
}

const clock = new DigitalClock();
