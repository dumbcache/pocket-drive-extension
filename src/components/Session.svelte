<script>
    import { onMount } from "svelte";

    let time = "";
    let intervalId;
    function formatTime(ms) {
        let totalSeconds = Math.floor(ms / 1000);
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        time = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    async function start() {
        let { session } = await chrome.storage.local.get();
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            const remaining = session - Date.now();
            if (remaining < 0) {
                time = "00:00";
                clearInterval(intervalId);
                chrome.runtime.sendMessage({
                    context: "LOGIN",
                });
                return;
            }
            formatTime(remaining);
        }, 1000);
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (message.context === "LOGIN") {
                message.status === 200 && start();
                return;
            }
        } catch (error) {
            console.warn("pocket sidepanel", error);
        }
    });

    onMount(async () => {
        start();
    });
</script>

<p title="session expiry">{time}</p>

<style>
    p {
        font-size: 1.1rem;
        user-select: none;
        color: var(--color-green);
    }
</style>
