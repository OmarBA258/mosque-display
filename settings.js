// Settings page logic.
// Builds the UI from settingsSchema, previews live,
// saves to localStorage.

let currentSettings = loadSettings();


const groupsContainer =
    document.getElementById("groups");

const statusLabel =
    document.getElementById("status");


// Preview settings on this page by loading the main stylesheet
// into a hidden iframe. Simpler: keep preview on the main
// screen itself, and only show a note here.

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


// Two-decimal percentage format

function percent(value) {

    return `${Math.round(value * 100)}%`;
}


// Two-decimal scale format

function times(value) {

    return `${value.toFixed(2)}x`;
}


// Background colors group

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


// Text colors group

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


// Text sizes group

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


// Spacing group

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


// Panels group = color + opacity per box

function buildPanelsGroup() {

    const group =
        buildGroup("ألوان وشفافية الصناديق");

    for (const item of settingsSchema.panels) {

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

        const panel =
            currentSettings.panels[item.key];

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

        group.appendChild(control);
    }

    return group;
}


// Apply settings to this page's CSS variables,
// so colors and sliders feel immediate.

function preview() {

    applySettings(currentSettings);
}


// Show a short status message

let statusTimer = null;

function showStatus(message) {

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

    setTimeout(() => {

        window.location.href = "index.html";

    }, 700);
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

    showStatus("تمت الاستعادة، اضغط حفظ للتثبيت");
}


// Build every group into the page

function renderGroups() {

    groupsContainer.innerHTML = "";

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


// Start

renderGroups();

preview();

document.getElementById("save")
    .addEventListener("click", handleSave);

document.getElementById("save-bottom")
    .addEventListener("click", handleSave);

document.getElementById("reset")
    .addEventListener("click", handleReset);