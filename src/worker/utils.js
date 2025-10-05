import { login, logout } from "./connection";
import { createFolder, fetchFolders, fetchSingle } from "./drive";

const HOSTNAME = new URL(chrome.runtime.getURL("")).hostname;
export const ENDPOINT = `http://127.0.0.1:5001/dumbcache4658/us-central1/pocketdrive`;
export const REDIRECT_URI = `https://${HOSTNAME}.chromiumapp.org/redirect`;
export const OAUTH = `https://accounts.google.com/o/oauth2/v2/auth?client_id=206697063226-p09kl0nq355h6q5440qlbikob3h8553u.apps.googleusercontent.com&prompt=select_account&response_type=token&scope=email https://www.googleapis.com/auth/drive.file&redirect_uri=${REDIRECT_URI}`;

export function checkRuntimeError() {
    chrome.runtime.lastError;
}

function isSystemLink(link) {
    return (
        link.startsWith("chrome://") ||
        link.startsWith("chrome-extension://") ||
        link.startsWith("chrome-search://")
    );
}

export function isSystemPage(tab) {
    return tab?.active && isSystemLink(tab?.url);
}

export function isLoggedIn() {
    return chrome.storage.local.get("token");
}

export async function getUserInfo(token) {
    const req = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return await req.json();
}

export async function getToken() {
    const { active, tokens } = await chrome.storage.local.get();
    return tokens[active];
}

/*********************************************************************
 *********************************************************************
 **********************  HANDLERS ************************************
 *********************************************************************
 *********************************************************************/

export const initContextMenus = async () => {
    chrome.contextMenus.removeAll(checkRuntimeError);

    const { active } = await chrome.storage.local.get("active");
    if (active) {
        chrome.action.setBadgeText({ text: active[0] }, checkRuntimeError);
        chrome.contextMenus.create(
            {
                id: "token",
                title: "NewSession",
                contexts: ["action"],
            },
            checkRuntimeError
        );
        chrome.contextMenus.create(
            {
                id: "logout",
                title: "Logout",
                contexts: ["action"],
            },
            checkRuntimeError
        );
    } else {
        chrome.contextMenus.create(
            {
                id: "login",
                title: "Login",
                contexts: ["action"],
            },
            checkRuntimeError
        );
        chrome.action.setBadgeText({ text: "" }, checkRuntimeError);
    }
    chrome.contextMenus.create(
        {
            id: "image",
            type: "separator",
            contexts: ["action"],
        },
        checkRuntimeError
    );
    chrome.contextMenus.create(
        {
            id: "images",
            title: "Images",
            contexts: ["action", "page", "image"],
        },
        checkRuntimeError
    );
    chrome.contextMenus.create({
        id: "options",
        title: "Options",
        contexts: ["action"],
    });
    const { hidden } = await chrome.storage.local.get("hidden");
    chrome.contextMenus.create(
        {
            id: "hidden",
            title: "Hidden",
            contexts: ["action"],
            type: "checkbox",
            checked: hidden ?? false,
            parentId: "options",
        },
        checkRuntimeError
    );
};

export function setSidePanelBehavior(b) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: b });
    chrome.sidePanel.setOptions({
        enabled: b,
    });
}

export async function installHandler() {
    initContextMenus();
    const { hidden } = await chrome.storage.local.get("hidden");
    setSidePanelBehavior(!hidden);
    console.log("installed");
}

export function startupHandler() {
    console.log("started");
}

export async function storageHandler(changes) {
    try {
        if (changes.active) {
            initContextMenus();
        }
    } catch (error) {
        console.warn("Storage onChange error", error);
    }
}

/**
 *
 * @param { chrome.contextMenus.OnClickData} info
 * @param { chrome.tabs.Tab} tab
 */
export function contextMenuHandler(info, tab) {
    performContextAction(info.menuItemId, tab, info);
}

/**
 * @param {string | number} action
 * @param { chrome.tabs.Tab} tab
 * @param { chrome.contextMenus.OnClickData} [info]
 */
export function performContextAction(action, tab, info) {
    try {
        switch (action) {
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
            case "hidden":
                chrome.storage.local.set({ hidden: info.checked });
                setSidePanelBehavior(!info.checked);

                return;
        }
    } catch (error) {
        console.warn("ContextMenu error:", error);
    }
}

/**
 *
 * @param {any} message
 * @param {chrome.runtime.MessageSender} sender
 * @param {(response?: any) => void} sendResponse
 */
export function messageHandler(message, sender, sendResponse) {
    performMessageAction(message, sender, sendResponse);
    return true;
}
/**
 *
 * @param {any} message
 * @param {chrome.runtime.MessageSender} sender
 * @param {(response?: any) => void} sendResponse
 */
function performMessageAction(message, sender, sendResponse) {
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
                }
            );
            return;
        }

        if (message.context === "FETCH_SINGLE") {
            fetchSingle(message.id).then(({ status, data }) => {
                sendResponse({
                    status,
                    data,
                });
            });
            return;
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
            return;
        }
    } catch (error) {
        console.warn("OnMessage error:", error);
        sendResponse({
            context: message.context,
            status: 500,
            error,
        });
    }
}
