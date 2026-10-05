const prayerId = new URLSearchParams(window.location.search).get("prayer");

setTimeout(() => {
    if (prayerId === "dhuhr" || prayerId === "jumuah") {
        window.location.replace("index.html");
        return;
    }

    const destination = prayerId
        ? `ikama.html?prayer=${encodeURIComponent(prayerId)}`
        : "ikama.html";

    window.location.replace(destination);
}, 2 * 60 * 1000);