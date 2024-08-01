<script>
    import List from "@components/List.svelte";
    import folderCreateIcon from "@assets/folderCreate.svg?raw";
    import fileCreateIcon from "@assets/fileCreate.svg?raw";
    import PocketIcon from "@assets/pocket.svg?raw";
    import { previewAndSetDropItems } from "@components/scripts/utils";
    import FolderCreate from "@components/FolderCreate.svelte";
    import { ROOT_ID, selected } from "./scripts/stores";
    import { get } from "svelte/store";

    let create = false;
    let path = "home";

    selected.subscribe((val) => {
        if (!val) return;
        path = val.id === get(ROOT_ID) ? "home" : val.id;
    });

    export async function imgPickerHandler(e) {
        e.preventDefault();
        const target = e.target;
        if (target.files) {
            await previewAndSetDropItems(target.files);
        }
        target.value = null;
    }
</script>

<header on:click|stopPropagation>
    <a
        href="https://www.pocketdrive.in/{path}"
        class="btn s-prime"
        title="open in pocket drive"
        target="_blank"
    >
        {@html PocketIcon}
    </a>
    <List />

    <button class="btn s-prime" on:click={() => (create = true)}
        >{@html folderCreateIcon}</button
    >
    <button class="btn s-prime img-picker">
        <label for="img-picker" class="button__create-img" title="add images">
            {@html fileCreateIcon}
        </label>
        <input
            type="file"
            name="img-picker"
            id="img-picker"
            accept="image/*,video/*"
            multiple
            on:change={imgPickerHandler}
        />
    </button>
</header>

{#if create}
    <FolderCreate on:close={() => (create = false)} />
{/if}

<style>
    header {
        /* background-color: var(--bg-color-one); */
        display: flex;
        flex-flow: row nowrap;
        gap: 0.7rem;
        padding: 1rem;
        align-items: center;
        justify-content: center;
        border-bottom: 1px solid #fff3;
    }
    button {
        flex-shrink: 0;
    }

    #img-picker {
        display: none;
    }
    .img-picker * {
        cursor: pointer;
    }
</style>
