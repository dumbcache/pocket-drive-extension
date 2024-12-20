<script>
    import { tick } from "svelte";
    import linkIcon from "@assets/link.svg?raw";
    import autosaveIcon from "@assets/autosave.svg?raw";
    import doneIcon from "@assets/doneall.svg?raw";
    import { saveAll } from "@scripts/utils";
    import Session from "@components/Session.svelte";
    import { states } from "@scripts/stores.svelte";

    function saveHandler() {
        states.autoSave = !states.autoSave;
    }

    async function linkHandler() {
        states.autoLink = !states.autoLink;
        await tick();
        if (states.autoLink) {
            chrome.tabs
                .query({ active: true, lastFocusedWindow: true })
                .then(([tab]) => {
                    states.link = tab?.url;
                });
        }
    }
</script>

<footer>
    <Session />
    <button
        class="btn s-prime"
        class:on={states.autoSave}
        title="autosave"
        on:click={saveHandler}>{@html autosaveIcon}</button
    >
    <button
        class="btn s-prime"
        class:on={states.autoLink}
        title="autolink"
        on:click={linkHandler}>{@html linkIcon}</button
    >
    <input
        type="search"
        title={states.link}
        placeholder="website link"
        bind:value={states.link}
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
