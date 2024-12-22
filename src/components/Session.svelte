<script>
    import { onMount } from "svelte";

    let time = $state("");
    let sessionExpired = $state(false);
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
                sessionExpired = true;
                return;
            }
            formatTime(remaining);
        }, 1000);
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (message.context === "LOGIN") {
                if (message.status === 200) {
                    start();
                    sessionExpired = false;
                }
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

{#if sessionExpired}
    <section>
        <div>Session expired. Start new Session</div>
        <button
            onclick={() => {
                chrome.runtime.sendMessage({
                    context: "LOGIN",
                });
            }}>New session</button
        >
        <button
            onclick={() => {
                chrome.runtime.sendMessage({
                    context: "LOGOUT",
                });
            }}>Logout</button
        >
    </section>
{/if}

<p title="session expiry">{time}</p>

<style>
    p {
        font-size: 1.1rem;
        user-select: none;
        color: var(--color-green);
    }

    section {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--bg-color-one);
        padding: 3rem;
        width: 90%;
        border-radius: 0.5rem;
        z-index: 10;
    }
    button {
        width: 10rem;
        margin-top: 1rem;
        background-color: #444;
        padding: 1rem;
        border-radius: 0.5rem;
    }
    button:focus,
    button:hover {
        background-color: #333;
    }
</style>
