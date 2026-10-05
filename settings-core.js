// Shared settings module.
// Used by index.html to apply saved settings,
// and by settings.html to edit them.

const SETTINGS_KEY = "mosqueSettings";


// Every adjustable option on the main screen.

const settingsSchema = {

    colors: [
        { key: "bg-inner", label: "الخلفية - المركز", default: "#16203e" },
        { key: "bg-mid", label: "الخلفية - الوسط", default: "#070b20" },
        { key: "bg-outer", label: "الخلفية - الأطراف", default: "#000000" },
        { key: "text", label: "لون النص العام", default: "#ffffff" }
    ],

    textColors: [
        { key: "mosque", label: "لون اسم المسجد", default: "#ffffff" },
        { key: "clock", label: "لون الساعة", default: "#ffffff" },
        { key: "date", label: "لون التاريخ", default: "#ffffff" },
        { key: "special", label: "لون الجمعة والشروق", default: "#ffffff" },
        { key: "countdown", label: "لون العد التنازلي", default: "#ffffff" },
        { key: "prayer-name", label: "لون اسم الصلاة", default: "#ffffff" },
        { key: "prayer-time", label: "لون وقت الصلاة", default: "#ffffff" },
        { key: "prayer-iqama", label: "لون وقت الإقامة", default: "#ffffff" }
    ],

    textSizes: [
        { key: "mosque", label: "اسم المسجد", default: 1 },
        { key: "clock", label: "الساعة", default: 1 },
        { key: "date", label: "التاريخ", default: 1 },
        { key: "special", label: "الجمعة والشروق", default: 1 },
        { key: "countdown", label: "العد التنازلي", default: 1 },
        { key: "icon", label: "أيقونة القبة", default: 1 },
        { key: "prayer-name", label: "اسم الصلاة", default: 1 },
        { key: "prayer-time", label: "وقت الصلاة", default: 1 },
        { key: "prayer-iqama", label: "وقت الإقامة", default: 1 }
    ],

    spacing: [
        { key: "screen-pad", label: "الهوامش الخارجية", default: 1 },
        { key: "screen-gap", label: "المسافات الرأسية", default: 1 },
        { key: "clock-gap", label: "المسافة بين الساعة والجمعة/الشروق", default: 1 },
        { key: "clock-width", label: "عرض مربع الساعة", default: 1 },
        { key: "prayer-gap", label: "المسافة بين الصلوات", default: 1 },
        { key: "prayer-height", label: "ارتفاع بطاقة الصلاة", default: 1 },
        { key: "radius", label: "انحناء الزوايا", default: 1 }
    ],

    panels: [
        {
            key: "clock-box",
            label: "مربع الساعة",
            color: "#820014",
            alpha: 0.85
        },
        {
            key: "countdown",
            label: "العد التنازلي",
            color: "#000000",
            alpha: 0.5
        },
        {
            key: "prayer",
            label: "خلفية الصلوات",
            color: "#000000",
            alpha: 0.55
        },
        {
            key: "prayer-active",
            label: "خلفية الصلاة القادمة",
            color: "#960014",
            alpha: 0.9
        }
    ],

    extra: [
        {
            key: "iqama-opacity",
            label: "شفافية وقت الإقامة",
            default: 0.78,
            min: 0,
            max: 1
        }
    ]
};


// Defaults object

function getDefaultSettings() {

    const defaults = {
        colors: {},
        textColors: {},
        textSizes: {},
        spacing: {},
        panels: {},
        extra: {}
    };

    for (const item of settingsSchema.colors) {
        defaults.colors[item.key] = item.default;
    }

    for (const item of settingsSchema.textColors) {
        defaults.textColors[item.key] = item.default;
    }

    for (const item of settingsSchema.textSizes) {
        defaults.textSizes[item.key] = item.default;
    }

    for (const item of settingsSchema.spacing) {
        defaults.spacing[item.key] = item.default;
    }

    for (const item of settingsSchema.panels) {
        defaults.panels[item.key] = {
            color: item.color,
            alpha: item.alpha
        };
    }

    for (const item of settingsSchema.extra) {
        defaults.extra[item.key] = item.default;
    }

    return defaults;
}


// Load saved settings, merged over defaults

function loadSettings() {

    const defaults = getDefaultSettings();

    let saved = {};

    try {
        saved =
            JSON.parse(
                localStorage.getItem(SETTINGS_KEY)
            ) || {};
    } catch {
        saved = {};
    }

    return {
        colors: { ...defaults.colors, ...saved.colors },
        textColors: { ...defaults.textColors, ...saved.textColors },
        textSizes: { ...defaults.textSizes, ...saved.textSizes },
        spacing: { ...defaults.spacing, ...saved.spacing },
        panels: { ...defaults.panels, ...saved.panels },
        extra: { ...defaults.extra, ...saved.extra }
    };
}


// Save settings

function saveSettings(settings) {

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );
}


// Remove settings

function clearSettings() {

    localStorage.removeItem(SETTINGS_KEY);
}


// Hex -> rgb numbers, because rgba() needs channels

function hexToRgbChannels(hex) {

    const clean =
        hex.replace("#", "");

    const full =
        clean.length === 3
            ? clean
                .split("")
                .map(c => c + c)
                .join("")
            : clean;

    const number =
        parseInt(full, 16);

    return {
        r: (number >> 16) & 255,
        g: (number >> 8) & 255,
        b: number & 255
    };
}


// Write settings into CSS variables

function applySettings(settings) {

    const root =
        document.documentElement;

    const style =
        root.style;

    for (const [key, value] of Object.entries(settings.colors)) {
        style.setProperty(`--${key}`, value);
    }

    for (const [key, value] of Object.entries(settings.textColors)) {
        style.setProperty(`--color-${key}`, value);
    }

    for (const [key, value] of Object.entries(settings.textSizes)) {
        style.setProperty(`--scale-${key}`, value);
    }

    for (const [key, value] of Object.entries(settings.spacing)) {
        style.setProperty(`--scale-${key}`, value);
    }

    for (const [key, value] of Object.entries(settings.extra)) {
        style.setProperty(`--${key}`, value);
    }

    for (const [key, value] of Object.entries(settings.panels)) {

        const channels =
            hexToRgbChannels(value.color);

        style.setProperty(`--${key}-bg-r`, channels.r);
        style.setProperty(`--${key}-bg-g`, channels.g);
        style.setProperty(`--${key}-bg-b`, channels.b);
        style.setProperty(`--${key}-alpha`, value.alpha);
    }
}