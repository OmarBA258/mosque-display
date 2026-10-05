import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { BrowserWindow } from "electrobun/main";

function registerWindowsStartup() {
    if (process.platform !== "win32") {
        return;
    }

    const channel = process.env.COTTONTAIL_ELECTROBUN_CHANNEL;

    if (!channel || channel === "dev") {
        return;
    }

    const launcherPath = join(dirname(process.execPath), "launcher.exe");

    if (!existsSync(launcherPath)) {
        return;
    }

    try {
        execFileSync("reg.exe", [
            "add",
            "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
            "/v",
            "MosquePrayerDisplay",
            "/t",
            "REG_SZ",
            "/d",
            `"${launcherPath}"`,
            "/f"
        ], {
            stdio: "ignore",
            windowsHide: true
        });
    } catch (error) {
        console.error("Could not enable Windows startup launch:", error);
    }
}

registerWindowsStartup();

const window = new BrowserWindow({
    title: "Mosque Prayer Display",
    url: "views://mainview/index.html",
    frame: {
        width: 1280,
        height: 720
    }
});

window.setFullScreen(true);