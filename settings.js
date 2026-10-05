// Settings UI.
// Runs in two modes:
//  - popup, on index.html, where the display stays visible
//    behind a drawer so every change shows up live
//  - full page, on settings.html

let currentSettings = loadSettings();


const groupsContainer =
    document.getElementById("groups");

const statusLabel =
    document.getElementById("status");


// The display page, when running as a popup.

const screenElement =
    document.querySelector(".screen");


function buildGroup(title) {

    const section =
        document.createElement("section");

    section.className = "group";

    const heading =
        document.createElement("h2");

    heading.className = "group-title";
    heading.textContent = title;

    section.appendChild(heading);

    return section;
}


// Text control

function createTextControl(
    label,
    value,
    onChange
) {

    const control =
        document.createElement("div");

    control.className = "control";

    const head =
        document.createElement("div");

    head.className = "control-head";

    const name =
        document.createElement("span");

    name.className = "control-label";
    name.textContent = label;

    head.appendChild(name);

    const input =
        document.createElement("input");

    input.type = "text";
    input.className = "text-input";
    input.dir = "rtl";
    input.value = value;

    input.addEventListener(
        "input",
        () => onChange(input.value)
    );

    control.appendChild(head);
    control.appendChild(input);

    return control;
}


// Color control

function createColorControl(
    label,
    value,
    onChange
) {

    const control =
        document.createElement("div");

    control.className = "control";

    const head =
        document.createElement("div");

    head.className = "control-head";

    const name =
        document.createElement("span");

    name.className = "control-label";
    name.textContent = label;

    head.appendChild(name);

    const input =
        document.createElement("input");

    input.type = "color";
    input.value = value;

    input.addEventListener(
        "input",
        () => onChange(input.value)
    );

    control.appendChild(head);
    control.appendChild(input);

    return control;
}


// Range control

function createRangeControl(
    label,
    value,
    options,
    format,
    onChange
) {

    const control =
        document.createElement("div");

    control.className = "control";

    const head =
        document.createElement("div");

    head.className = "control-head";

    const name =
        document.createElement("span");

    name.className = "control-label";
    name.textContent = label;

    const readout =
        document.createElement("span");

    readout.className = "control-value";
    readout.textContent =
        format(value);

    head.appendChild(name);
    head.appendChild(readout);

    const input =
        document.createElement("input");

    input.type = "range";
    input.min = options.min;
    input.max = options.max;
    input.step = options.step;
    input.value = value;

    input.addEventListener(
        "input",
        () => {

            const number =
                Number(input.value);

            readout.textContent =
                format(number);

            onChange(number);
        }
    );

    control.appendChild(head);
    control.appendChild(input);

    return control;
}


// Panel control = one color plus its opacity

function createPanelControl(item) {

    const panel =
        currentSettings.panels[item.key];

    const control =
        document.createElement("div");

    control.className = "control";

    const head =
        document.createElement("div");

    head.className = "control-head";

    const name =
        document.createElement("span");

    name.className = "control-label";
    name.textContent = item.label;

    const readout =
        document.createElement("span");

    readout.className = "control-value";
    readout.textContent =
        percent(panel.alpha);

    head.appendChild(name);
    head.appendChild(readout);

    const colors =
        document.createElement("div");

    colors.className = "panel-colors";

    const colorInput =
        document.createElement("input");

    colorInput.type = "color";
    colorInput.value = panel.color;

    const alphaInput =
        document.createElement("input");

    alphaInput.type = "range";
    alphaInput.min = 0;
    alphaInput.max = 1;
    alphaInput.step = 0.02;
    alphaInput.value = panel.alpha;

    colorInput.addEventListener(
        "input",
        () => {

            panel.color =
                colorInput.value;

            preview();
        }
    );

    alphaInput.addEventListener(
        "input",
        () => {

            panel.alpha =
                Number(alphaInput.value);

            readout.textContent =
                percent(panel.alpha);

            preview();
        }
    );

    colors.appendChild(colorInput);
    colors.appendChild(alphaInput);

    control.appendChild(head);
    control.appendChild(colors);

    return control;
}


// Formats

function percent(value) {

    return `${Math.round(value * 100)}%`;
}


function times(value) {

    return `${value.toFixed(2)}x`;
}


// Groups

function buildTextsGroup() {

    const group =
        buildGroup("النصوص القابلة للتعديل");

    for (const item of settingsSchema.texts) {

        group.appendChild(
            createTextControl(
                item.label,
                currentSettings.texts[item.key],
                value => {

                    currentSettings.texts[item.key] =
                        value;

                    preview();
                }
            )
        );
    }

    return group;
}


function buildBackgroundGroup() {

    const group =
        buildGroup("خلفية الشاشة");

    for (const item of settingsSchema.colors) {

        group.appendChild(
            createColorControl(
                item.label,
                currentSettings.colors[item.key],
                value => {

                    currentSettings.colors[item.key] =
                        value;

                    preview();
                }
            )
        );
    }

    return group;
}


function buildTextColorsGroup() {

    const group =
        buildGroup("ألوان النصوص");

    for (const item of settingsSchema.textColors) {

        group.appendChild(
            createColorControl(
                item.label,
                currentSettings.textColors[item.key],
                value => {

                    currentSettings.textColors[item.key] =
                        value;

                    preview();
                }
            )
        );
    }

    return group;
}


function buildPanelsGroup() {

    const group =
        buildGroup("ألوان وشفافية الصناديق");

    for (const item of settingsSchema.panels) {

        group.appendChild(
            createPanelControl(item)
        );
    }

    return group;
}


function buildTextSizesGroup() {

    const group =
        buildGroup("أحجام النصوص");

    const options = {
        min: 0.5,
        max: 2.5,
        step: 0.05
    };

    for (const item of settingsSchema.textSizes) {

        group.appendChild(
            createRangeControl(
                item.label,
                currentSettings.textSizes[item.key],
                options,
                times,
                value => {

                    currentSettings.textSizes[item.key] =
                        value;

                    preview();
                }
            )
        );
    }

    return group;
}


function buildSpacingGroup() {

    const group =
        buildGroup("التباعد والمسافات");

    const options = {
        min: 0,
        max: 2.5,
        step: 0.05
    };

    for (const item of settingsSchema.spacing) {

        group.appendChild(
            createRangeControl(
                item.label,
                currentSettings.spacing[item.key],
                options,
                times,
                value => {

                    currentSettings.spacing[item.key] =
                        value;

                    preview();
                }
            )
        );
    }

    for (const item of settingsSchema.extra) {

        group.appendChild(
            createRangeControl(
                item.label,
                currentSettings.extra[item.key],
                {
                    min: item.min,
                    max: item.max,
                    step: 0.02
                },
                percent,
                value => {

                    currentSettings.extra[item.key] =
                        value;

                    preview();
                }
            )
        );
    }

    return group;
}


// Apply changes to the visible display

function preview() {

    applySettings(currentSettings);
}


// Status line

let statusTimer = null;

function showStatus(message) {

    if (!statusLabel) {
        return;
    }

    statusLabel.textContent = message;

    clearTimeout(statusTimer);

    statusTimer = setTimeout(() => {

        statusLabel.textContent = "";

    }, 3000);
}


// Save

function handleSave() {

    saveSettings(currentSettings);

    showStatus("تم الحفظ");
}


// Reset to defaults

function handleReset() {

    if (!confirm("هل تريد استعادة الإعدادات الافتراضية؟")) {
        return;
    }

    clearSettings();

    currentSettings =
        getDefaultSettings();

    renderGroups();

    preview();

    showStatus("تمت الاستعادة");
}


// Build all groups

function renderGroups() {

    if (!groupsContainer) {
        return;
    }

    groupsContainer.innerHTML = "";

    groupsContainer.appendChild(
        buildTextsGroup()
    );

    groupsContainer.appendChild(
        buildBackgroundGroup()
    );

    groupsContainer.appendChild(
        buildTextColorsGroup()
    );

    groupsContainer.appendChild(
        buildPanelsGroup()
    );

    groupsContainer.appendChild(
        buildTextSizesGroup()
    );

    groupsContainer.appendChild(
        buildSpacingGroup()
    );
}


// Drawer open/close, popup mode only

function setDrawerOpen(open) {

    document.body.classList.toggle(
        "drawer-open",
        open
    );

    const toggle =
        document.getElementById("drawerToggle");

    if (toggle) {
        toggle.setAttribute(
            "aria-expanded",
            String(open)
        );
    }
}


// Wire up a button by id

function bind(id, event, handler) {

    const element =
        document.getElementById(id);

    if (element) {
        element.addEventListener(event, handler);
    }
}


// Start

renderGroups();

preview();

bind("save", "click", handleSave);
bind("save-bottom", "click", handleSave);
bind("reset", "click", handleReset);

bind("drawerToggle", "click", () => {

    const open =
        document.body.classList.contains("drawer-open");

    setDrawerOpen(!open);
});

bind("drawerClose", "click", () => {

    setDrawerOpen(false);
});


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        setDrawerOpen(false);
    }
});