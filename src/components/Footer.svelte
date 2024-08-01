<script>
    import { tick } from "svelte";
    import linkIcon from "@assets/link.svg?raw";
    import autosaveIcon from "@assets/autosave.svg?raw";
    import doneIcon from "@assets/doneall.svg?raw";
    import { autoLink, autoSave, link } from "@scripts/stores";
    import { get } from "svelte/store";
    import { saveAll } from "@scripts/utils";
    import Session from "@components/Session.svelte";

    function saveHandler() {
        autoSave.update((prev) => !prev);
    }

    async function linkHandler() {
        autoLink.update((prev) => !prev);
        await tick();
        if (get(autoLink)) {
            chrome.tabs
                .query({ active: true, lastFocusedWindow: true })
                .then(([tab]) => {
                    link.set(tab?.url);
                });
        }
    }
</script>

<footer>
    <Session />
    <button
        class="btn s-prime"
        class:on={$autoSave}
        title="autosave"
        on:click={saveHandler}>{@html autosaveIcon}</button
    >
    <button
        class="btn s-prime"
        class:on={$autoLink}
        title="autolink"
        on:click={linkHandler}>{@html linkIcon}</button
    >
    <input
        type="search"
        title={$link}
        placeholder="website link"
        bind:value={$link}
        on:click={(e) => e.target.select()}
    />
    <button class="btn s-prime" title="save all" on:click={saveAll}
        >{@html doneIcon}</button
    >
</footer>

<style>
    footer {
        display: flex;
        flex-flow: row nowrap;
        gap: 1rem;
        padding: 1rem;
        align-items: center;
        justify-content: center;
        border-top: 1px solid #fff3;
    }
    button {
        flex-shrink: 0;
    }
    input {
        width: 100%;
        padding: 0.7rem 0.5rem 0.5rem 0.5rem;
        background-color: var(--bg-color-one);
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        max-width: 20rem;
        color: var(--color-focus);
    }
    input:hover {
        /* border-bottom: 1px solid var(--color-focus); */
        /* background-color: var(--bg-color-two); */
    }
    .on :global(svg) {
        fill: #f00;
    }
</style>
