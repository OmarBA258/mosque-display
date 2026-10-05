const prayers = [
    { id: "fajr", name: "الفجر" },
    { id: "dhuhr", name: "الظهر" },
    { id: "asr", name: "العصر" },
    { id: "maghrib", name: "المغرب" },
    { id: "isha", name: "العشاء" }
];

const prayerId = new URLSearchParams(window.location.search).get("prayer");

let prayerData = {};

function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function timeToMinutes(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

function getTimeToday(now, minutes) {
    const target = new Date(now);
    target.setHours(0, minutes, 0, 0);
    return target;
}

function getIqamaTarget(today, prayer, prayerStart) {
    const setting = prayerData.iqama[prayer.id];

    if (typeof setting === "string") {
        return getTimeToday(prayerStart, timeToMinutes(setting));
    }

    const target = new Date(prayerStart);
    target.setMinutes(target.getMinutes() + setting);
    return target;
}

function getPrayerIqamaTarget(today, now) {
    const prayer = prayers.find(item => item.id === prayerId);

    if (!prayer) {
        return null;
    }

    const prayerStart = getTimeToday(
        now,
        timeToMinutes(today.times[prayer.id])
    );

    return getIqamaTarget(today, prayer, prayerStart);
}

function displayCountdown(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    document.getElementById("countdown").textContent =
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
}

function showCountdown(phase, name, target, now) {
    document.getElementById("countdown-phase").textContent = phase;
    document.getElementById("countdown-name").textContent = name;
    displayCountdown(target - now);
}

function updateScreen() {
    const now = new Date();
    const today = prayerData[getTodayKey()];

    if (!today) {
        document.getElementById("countdown").textContent = "--:--:--";
        return;
    }

    const iqamaTarget = getPrayerIqamaTarget(today, now);

    if (!iqamaTarget) {
        document.getElementById("countdown").textContent = "--:--";
        return;
    }

    if (now >= iqamaTarget) {
        window.location.replace("index.html");
        return;
    }

    displayCountdown(iqamaTarget - now);
}

async function loadPrayerData() {
    try {
        const response = await fetch("data/prayer-times.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Could not load prayer times");
        }

        prayerData = await response.json();
        updateScreen();
    } catch (error) {
        document.getElementById("countdown").textContent = "--:--";
        console.error(error);
    }
}

loadPrayerData();
setInterval(updateScreen, 1000);
setInterval(loadPrayerData, 30000);