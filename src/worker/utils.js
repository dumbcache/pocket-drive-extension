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

export const initContextMenus = async () => {
    chrome.contextMenus.removeAll(checkRuntimeError);

    chrome.contextMenus.create(
        {
            id: "images",
            title: "Images",
            contexts: ["page", "image"],
        },
        checkRuntimeError
    );
    const { active } = await chrome.storage.local.get("active");
    if (active) {
        chrome.action.setBadgeText({ text: active[0] }, checkRuntimeError);
        chrome.contextMenus.create(
            {
                id: "image",
                title: "Images",
                contexts: ["action"],
            },
            checkRuntimeError
        );
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
        return;
    }
};

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
