let prayerData = {};


// Arabic weekdays

const weekdays = [
    "الأحد",
    "الاثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت"
];


// Prayer order

const prayers = [
    {
        id: "fajr",
        name: "الفجر"
    },
    {
        id: "dhuhr",
        name: "الظهر"
    },
    {
        id: "asr",
        name: "العصر"
    },
    {
        id: "maghrib",
        name: "المغرب"
    },
    {
        id: "isha",
        name: "العشاء"
    }
];

function isJumuahDay(date = new Date()) {
    return date.getDay() === 5;
}

function getPrayerListForDay(now) {
    if (isJumuahDay(now)) {
        return [
            { id: "jumuah", name: "الجمعة" },
            ...prayers.filter(prayer => prayer.id !== "dhuhr")
        ];
    }

    return prayers;
}

let lastPrayerCheck = new Date();
let showHijriDate = true;


// Get today's date in YYYY-MM-DD

function getTodayKey() {

    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// Convert HH:MM into minutes

function timeToMinutes(time) {

    const [hours, minutes] = time
        .split(":")
        .map(Number);

    return hours * 60 + minutes;
}


// Load JSON file

async function loadPrayerData() {

    try {

        const response =
            await fetch("data/prayer-times.json", { cache: "no-store" });

        prayerData =
            await response.json();

        updateDisplay();

    } catch (error) {

        console.error(
            "Could not load prayer-times.json:",
            error
        );

        document.getElementById("date").textContent =
            "خطأ في تحميل أوقات الصلاة";
    }
}


// Update everything

function updateDisplay() {

    const todayKey = getTodayKey();

    const today = prayerData[todayKey];

    if (!today) {

        document.getElementById("date").textContent =
            "لا توجد بيانات لهذا اليوم";

        return;
    }


    updateDate(today);

    updatePrayerTimes(today);

    updateClock(today);
}


// Update Hijri/Gregorian date

function updateDate(today) {

    const now = new Date();

    const weekday =
        weekdays[now.getDay()];

    const gregorianDay =
        now.getDate();

    const gregorianMonth =
        new Intl.DateTimeFormat("ar", {
            month: "long",
            calendar: "gregory"
        }).format(now);

    const gregorianYear =
        now.getFullYear();


    document.getElementById("date").textContent = showHijriDate
        ? `${weekday} ${today.hijri.day} ${today.hijri.month} ${today.hijri.year}`
        : `${weekday} ${gregorianDay} ${gregorianMonth} ${gregorianYear}`;
}


// Put prayer times on screen

function updatePrayerTimes(today) {
    document.querySelector("#fajr .prayer-time")
        .textContent = today.times.fajr;

    document.querySelector("#dhuhr .prayer-time")
        .textContent = today.times.dhuhr;

    document.querySelector("#asr .prayer-time")
        .textContent = today.times.asr;

    document.querySelector("#maghrib .prayer-time")
        .textContent = today.times.maghrib;

    document.querySelector("#isha .prayer-time")
        .textContent = today.times.isha;


    document.getElementById("sunrise")
        .textContent = today.times.sunrise;

    document.getElementById("jumuah")
        .textContent = today.times.jumuah ?? prayerData.jumuah;


    for (const prayer of prayers) {
        const iqamaLabel =
            document.querySelector(`#${prayer.id} .prayer-iqama`);

        if (!iqamaLabel) {
            continue;
        }

        const visible = prayer.id === "dhuhr";

        iqamaLabel.textContent = visible
            ? `${prayerData.iqama.dhuhr}`
            : `+${prayerData.iqama[prayer.id]}`;
    }
}


// Live clock

function updateClock(today) {

    const now = new Date();

    const hours =
        String(now.getHours())
        .padStart(2, "0");

    const minutes =
        String(now.getMinutes())
        .padStart(2, "0");

    const seconds =
        String(now.getSeconds())
        .padStart(2, "0");


    document.getElementById("clock")
        .textContent =
        `${hours}:${minutes}:${seconds}`;


    if (redirectAtPrayerTime(today, now)) {
        return;
    }

    updateNextPrayer(today, now);
}


// Switch to the adhan screen when a prayer time is reached.

function redirectAtPrayerTime(today, now) {

    const previousCheck = lastPrayerCheck;
    lastPrayerCheck = now;

    if (isJumuahDay(now)) {
        const [hours, minutes] =
            today.times.jumuah
                .split(":")
                .map(Number);

        const jumuahTime = new Date(now);
        jumuahTime.setHours(hours, minutes, 0, 0);

        const justReachedPrayer =
            previousCheck < jumuahTime &&
            now >= jumuahTime &&
            now - jumuahTime < 60_000;

        if (justReachedPrayer) {
            window.location.href = "athan.html?prayer=jumuah";
            return true;
        }
    }

    const dhuhrIqama = prayerData.iqama.dhuhr;

    if (typeof dhuhrIqama === "string") {

        const [hours, minutes] =
            dhuhrIqama.split(":").map(Number);

        const iqamaTime = new Date(now);
        iqamaTime.setHours(hours, minutes, 0, 0);

        const countdownStart = new Date(iqamaTime);
        countdownStart.setMinutes(countdownStart.getMinutes() - 5);

        if (now >= countdownStart && now < iqamaTime && !isJumuahDay(now)) {
            window.location.href = "ikama.html?prayer=dhuhr";
            return true;
        }
    }

    for (const prayer of prayers) {
        if (prayer.id === "dhuhr" && isJumuahDay(now)) {
            continue;
        }

        const [hours, minutes] =
            today.times[prayer.id]
                .split(":")
                .map(Number);

        const prayerTime = new Date(now);
        prayerTime.setHours(hours, minutes, 0, 0);

        const justReachedPrayer =
            previousCheck < prayerTime &&
            now >= prayerTime &&
            now - prayerTime < 60_000;

        if (justReachedPrayer) {
            window.location.href =
                `athan.html?prayer=${encodeURIComponent(prayer.id)}`;
            return true;
        }
    }

    return false;
}


// Find next prayer

function updateNextPrayer(today, now) {
    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    const friday = isJumuahDay(now);
    const prayerList = getPrayerListForDay(now);

    let nextPrayer = null;

    for (const prayer of prayerList) {
        const prayerTime =
            prayer.id === "jumuah"
                ? today.times.jumuah
                : today.times[prayer.id];

        const prayerMinutes =
            timeToMinutes(prayerTime);

        if (prayerMinutes > currentMinutes) {
            nextPrayer = prayer;
            break;
        }
    }

    if (!nextPrayer) {
        nextPrayer = prayers[0];

        document.getElementById("countdown-name")
            .textContent =
            "الفجر";

        updateCountdownTomorrow(
            today.times.fajr,
            now
        );
    } else {
        document.getElementById("countdown-name")
            .textContent =
            nextPrayer.name;

        updateCountdown(
            nextPrayer.id === "jumuah"
                ? today.times.jumuah
                : today.times[nextPrayer.id],
            now
        );
    }

    if (friday) {
        const jumuahTime = timeToMinutes(today.times.jumuah);

        if (currentMinutes < jumuahTime) {
            highlightPrayer(null);
        } else {
            highlightPrayer(nextPrayer.id);
        }

        return;
    }

    const dhuhrIqama = prayerData.iqama.dhuhr;
    const dhuhrStart = new Date(now);
    const [dhuhrHours, dhuhrMinutes] =
        today.times.dhuhr.split(":").map(Number);
    dhuhrStart.setHours(dhuhrHours, dhuhrMinutes, 0, 0);

    const dhuhrIqamaTime = new Date(now);

    if (typeof dhuhrIqama === "string") {
        const [iqamaHours, iqamaMinutes] =
            dhuhrIqama.split(":").map(Number);
        dhuhrIqamaTime.setHours(iqamaHours, iqamaMinutes, 0, 0);
    } else {
        dhuhrIqamaTime.setTime(dhuhrStart.getTime());
        dhuhrIqamaTime.setMinutes(
            dhuhrIqamaTime.getMinutes() + dhuhrIqama
        );
    }

    if (now >= dhuhrStart && now < dhuhrIqamaTime) {
        document.getElementById("countdown-name")
            .textContent = "الإقامة";

        displayCountdown(dhuhrIqamaTime - now);
    }

    const highlightedPrayer =
        now >= dhuhrStart && now < dhuhrIqamaTime
            ? "dhuhr"
            : nextPrayer.id;

    highlightPrayer(highlightedPrayer);
}


// Highlight next prayer

function highlightPrayer(id) {

    document.querySelectorAll(".prayer")
        .forEach(element => {

            element.classList.remove("active");

        });

    if (!id) {
        return;
    }

    const activePrayer =
        document.getElementById(id);


    if (activePrayer) {

        activePrayer.classList.add("active");
    }
}


// Countdown for today's next prayer

function updateCountdown(time, now) {

    const [hours, minutes] =
        time.split(":").map(Number);


    const target =
        new Date(now);

    target.setHours(
        hours,
        minutes,
        0,
        0
    );


    let difference =
        target - now;


    if (difference < 0) {

        difference = 0;
    }


    displayCountdown(difference);
}


// Countdown to tomorrow's Fajr

function updateCountdownTomorrow(time, now) {

    const [hours, minutes] =
        time.split(":").map(Number);


    const target =
        new Date(now);


    target.setDate(
        target.getDate() + 1
    );


    target.setHours(
        hours,
        minutes,
        0,
        0
    );


    const difference =
        target - now;


    displayCountdown(difference);
}


// Show countdown

function displayCountdown(milliseconds) {

    const totalSeconds =
        Math.floor(milliseconds / 1000);


    const hours =
        Math.floor(totalSeconds / 3600);


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    document.getElementById("countdown")
        .textContent =
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}:` +
        `${String(seconds).padStart(2, "0")}`;
}


// Start

// Apply saved display settings before the first paint of content.

applySettings(loadSettings());

loadPrayerData();


// Update clock every second

setInterval(() => {

    if (Object.keys(prayerData).length > 0) {

        const todayKey = getTodayKey();

        const today = prayerData[todayKey];

        if (today) {
            updateClock(today);
        }
    }

}, 1000);


// Refresh prayer times so file edits appear without reloading.

setInterval(() => {

    loadPrayerData();

}, 30000);


// Alternate between Hijri and Gregorian dates every ten seconds.

setInterval(() => {

    showHijriDate = !showHijriDate;

    const today = prayerData[getTodayKey()];

    if (today) {
        updateDate(today);
    }

}, 10000);
