<script>
    import Drop from "@components/Drop.svelte";
    import Footer from "@components/Footer.svelte";
    import Header from "@components/Header.svelte";
    import PocketIcon from "@assets/pocket.svg?raw";
    import { onMount } from "svelte";
    import { isLoggedin } from "@scripts/stores";
    import Spinner from "@components/Spinner.svelte";

    let spin = false;
    function loginHandler() {
        spin = true;
        chrome.runtime.sendMessage({ context: "LOGIN" });
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (message.context === "LOGIN") {
                message.status === 200 && isLoggedin.set(true);
                spin = false;
                return;
            }
            if (message.context === "LOGOUT") {
                isLoggedin.set(false);
                return;
            }
        } catch (error) {
            console.warn("pocket sidepanel", error);
        }
    });

    onMount(async () => {
        const { active } = await chrome.storage.local.get();
        if (active) {
            isLoggedin.set(true);
        }
    });
</script>

<svelte:window />

<main class="wrapper">
    {#if $isLoggedin}
        <section>
            <Header />
        </section>
        <section class="main">
            <Drop />
        </section>
        <section>
            <Footer />
        </section>
    {:else}
        <section class="offline">
            <p class="logo">{@html PocketIcon}</p>
            <button on:click={loginHandler}
                >Login to continue using the app
            </button>
            <span class="spinner" style:visibility={spin ? "visible" : "hidden"}
                ><Spinner /></span
            >
        </section>
    {/if}
</main>

<style>
    .wrapper {
        display: grid;
        height: 100vh;
        grid-template-rows: auto 1fr auto;
    }
    .main {
        overflow-y: hidden;
    }

    .offline {
        display: grid;
        width: 100%;
        height: 100%;
        place-content: center;
        place-items: center;
        position: fixed;
    }

    button {
        padding: 1rem;
        border-radius: 1rem;
        background-color: var(--bg-color-one);
    }

    .logo {
        width: 10rem;
    }
    button:hover {
        background-color: var(--bg-color-two);
    }

    .spinner {
        position: relative;
        top: 1rem;
    }
</style>
