import ChildWorker from "@scripts/webworker.js?worker";
import { dropStore, states } from "@scripts/stores.svelte";

let recentUpdateTimeout;
let clearFinishedTimeout;

/**
 * @param {FileList} files
 */
export async function previewAndSetDropItems(files) {
    let { name, url } = await getCurrentTabDetails();
    if (states.autoLink) states.link = url;
    for (let file of files) {
        const id = Math.round(Math.random() * Date.now()).toString();
        const imgRef = URL.createObjectURL(file);
        let item = {
            id,
            name,
            displayName: file.name,
            mimeType: file.type,
            imgRef,
            status: "",
        };
        dropStore.items.push(item);
        if (file.type.match("image/")) {
            if (
                file.type === "image/gif" ||
                file.type === "image/avif" ||
                file.type === "image/webp"
            ) {
                let t = dropStore.items.find((i) => i.id === item.id);
                if (!t) return;
                t.file = file;
                t.loaded = true;

                if (states.autoSave) {
                    setTimeout(() => save(t), 500);
                }
            } else {
                const image = new Image();
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                image.onload = function () {
                    canvas.width = this.naturalWidth; // update canvas size to match image
                    canvas.height = this.naturalHeight;
                    ctx.drawImage(this, 0, 0);
                    canvas.toBlob(async function (blob) {
                        let t = dropStore.items.find((i) => i.id === item.id);
                        if (!t) return;
                        t.file = blob;
                        t.mimeType = blob.type;
                        t.loaded = true;

                        if (states.autoSave) {
                            setTimeout(() => save(t), 500);
                        }
                    }, "image/webp");
                };
                image.onerror = function () {
                    alert("Error in loading");
                };
                image.crossOrigin = ""; // if from different origin
                image.src = imgRef;
            }
        }
        if (file.type.match("video/")) {
            let t = dropStore.items.find((i) => i.id === item.id);
            if (!t) return;
            t.file = file;
            t.loaded = true;
        }
    }
}

export async function saveAll() {
    let token = await getToken();
    let url = states.link.trim();
    let choosen = states.selected;
    dropStore.items.forEach((item) => {
        save(item, token, url, choosen);
    });
}

/**
 *
 * @param {DropItem} item
 * @param {string} [token]
 * @param {string} [url]
 * @param {Selected} [choosen]
 */
export async function save(item, token, url, choosen) {
    if (item.status === "uploading" || item.status === "success") return;
    token ||= await getToken();
    url ||= states.link.trim();
    choosen ||= states.selected;
    item.status = "uploading";
    item.parent = choosen.id;
    item.url = url;
    let WorkerMessage = {
        context: "SAVE",
        dropItem: { ...item },
        parent: choosen.id,
        token,
    };
    childWorker.postMessage(WorkerMessage);
    clearTimeout(recentUpdateTimeout);
    recentUpdateTimeout = setTimeout(() => {
        updateRecents(choosen);
    }, 1000);
}

export async function updateRecents(selected) {
    let { active, recents } = await chrome.storage.local.get();
    recents ??= {};
    let history = recents[active];
    history ??= [];
    history = history.filter((i) => i.id !== selected.id);
    history.unshift(selected);
    recents[active] = history;
    await chrome.storage.local.set({ recents });
}

export async function clearFinished() {
    dropStore.items = dropStore.items.filter((i) => i.status !== "success");
}

export async function getCurrentTabDetails() {
    const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true,
    });
    return { name: tab?.title, url: tab?.url };
}

export async function getToken() {
    const { active, tokens } = await chrome.storage.local.get();
    return tokens[active];
}

export const childWorker = new ChildWorker();
childWorker.onerror = (e) => console.warn(e);
childWorker.onmessage = async ({ data }) => {
    let { id, parent, context, progressType, progress, status } = data;

    switch (context) {
        case "SAVE":
            let item = dropStore.items.find((i) => i.id === id);
            item.status = status === "success" ? "success" : "";

            if (status === "success") {
                clearTimeout(clearFinishedTimeout);
                clearFinishedTimeout = setTimeout(clearFinished, 2000);
            }
            return;

        case "PROGRESS":
            if (progressType === "SAVE") {
                let dropItem = document.querySelector(
                    `.drop-item[data-id="${id}"]`
                );
                dropItem.querySelector(
                    ".progress-count"
                ).innerHTML = `${progress}%`;
            }

            return;
    }
};
