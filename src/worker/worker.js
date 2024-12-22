import { initContextMenus, isSystemPage } from "./utils.js";
import { createFolder, fetchSingle, fetchFolders } from "./drive.js";
import { login, logout } from "./connection.js";

try {
    chrome.runtime.onInstalled.addListener(initContextMenus);

    chrome.runtime.onStartup.addListener(initContextMenus);

    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

    chrome.storage.onChanged.addListener(async (changes) => {
        if (changes.active) {
            initContextMenus();
        }
    });

    chrome.contextMenus.onClicked.addListener(async (info, tab) => {
        try {
            switch (info.menuItemId) {
                case "login":
                case "token":
                    login();
                    return;
                case "logout":
                    logout();
                    return;
                case "image":
                case "images":
                    chrome.tabs.sendMessage(tab.id, {
                        context: "IMAGES",
                    });
                    return;
            }
        } catch (error) {
            console.warn("ContextMenu error:", error);
        }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (isSystemPage(sender.tab)) return;

            if (message.context === "LOGIN") {
                login();
                return;
            }
            if (message.context === "LOGOUT") {
                logout();
                return;
            }

            if (message.context === "FOLDERS") {
                fetchFolders(message?.parent, "", message?.refresh).then(
                    ({ status, data }) => {
                        sendResponse({
                            status,
                            data,
                        });
                        return;
                    }
                );
                return true;
            }

            if (message.context === "FETCH_SINGLE") {
                fetchSingle(message.id).then(({ status, data }) => {
                    sendResponse({
                        status,
                        data,
                    });
                });
                return true;
            }

            if (message.context === "CREATE") {
                const { name, parent } = message;
                createFolder(name, parent).then(({ status, data }) => {
                    chrome.runtime.sendMessage({
                        context: "CREATE",
                        data,
                    });
                    sendResponse({
                        status,
                    });
                });
                return true;
            }
        } catch (error) {
            console.warn(`${message.context} error: ${error.cause}`);
            sendResponse({
                context: message.context,
                status: 500,
                error,
            });
        }
    });
} catch (error) {
    console.warn("Service Worker error:", error);
}
