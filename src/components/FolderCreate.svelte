<script>
    import doneIcon from "@assets/done.svg?raw";
    import { onMount } from "svelte";
    import Spinner from "@components/Spinner.svelte";
    import { states } from "./scripts/stores.svelte";

    let { onClose } = $props();

    let val = $state("");
    let inputElement;
    let progress = $state(false);

    let submitDisabled = $derived(val.trim() === "");

    export function toTitleCase(str) {
        return str
            .replace(/\b\w/g, (char) => char.toUpperCase())
            .replace(/\s+/g, " ")
            .trim();
    }

    async function handleCreate() {
        progress = true;
        val = toTitleCase(val);
        let { status, error } = await chrome.runtime.sendMessage({
            context: "CREATE",
            name: val,
            parent: states.selected.id,
        });
        progress = false;
        if (status === 200) {
            onClose();
        }
    }

    onMount(() => {
        inputElement.focus();
    });
</script>

<div
    class="modal-wrapper"
    on:click|stopPropagation={() => progress || onClose()}
>
    <form
        class="modal"
        on:click|stopPropagation
        on:submit|preventDefault={handleCreate}
    >
        <label for="folder-create"> Enter folder name </label>
        <div class="input-wrapper">
            <input
                type="search"
                name="folderName"
                id="folder-create"
                autocomplete="off"
                bind:value={val}
                bind:this={inputElement}
            />
            {#if !progress}
                <button
                    type="submit"
                    disabled={submitDisabled}
                    class="s-prime submit">{@html doneIcon}</button
                >
            {:else}
                <Spinner />
            {/if}
        </div>
    </form>
</div>

<style>
    .modal-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: grid;
        place-items: center;
        z-index: 1;
    }
    .modal {
        padding: 2rem;
        background-color: var(--bg-color-one);
        width: 100%;
        max-width: 27rem;
        display: flex;
        flex-flow: column;
        gap: 2rem;
        border-radius: 1rem;
        box-shadow: 0 0 50px 5px #000;
    }
    .input-wrapper {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    input {
        padding: 1rem;
        background-color: var(--bg-color-two);
        max-width: 20rem;
    }
    .submit :global(svg) {
        fill: var(--color-green);
    }
    button:disabled :global(svg) {
        fill: #555;
        cursor: not-allowed;
    }
</style>
