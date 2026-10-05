import type { ElectrobunConfig } from "electrobun";

export default {
    app: {
        name: "Mosque Prayer Display",
        identifier: "dev.mosque.prayer-display",
        version: "1.0.0"
    },
    build: {
        mainProcess: "cottontail",
        cottontail: {
            entrypoint: "src/bun/index.ts"
        },
        copy: {
            "index.html": "views/mainview/index.html",
            "style.css": "views/mainview/style.css",
            "app.js": "views/mainview/app.js",
            "athan.html": "views/mainview/athan.html",
            "athan.css": "views/mainview/athan.css",
            "athan.js": "views/mainview/athan.js",
            "ikama.html": "views/mainview/ikama.html",
            "ikama.css": "views/mainview/ikama.css",
            "ikama.js": "views/mainview/ikama.js",
            "cupola.png": "views/mainview/cupola.png",
            "data/prayer-times.json": "views/mainview/data/prayer-times.json"
        },
        win: {
            bundleCEF: false,
            defaultRenderer: "native"
        }
    }
} satisfies ElectrobunConfig;