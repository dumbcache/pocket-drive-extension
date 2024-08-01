<script>
    import DropItem from "@components/DropItem.svelte";
    import { previewAndSetDropItems } from "@components/scripts/utils";
    import { dropItems } from "@scripts/stores";

    let draggedOver = false;

    function handlePaste(e) {
        const clipboardItems = e.clipboardData?.items;
        if (!clipboardItems) return;
        for (const item of clipboardItems) {
            if (item.type.match("image/")) {
                const file = item.getAsFile();
                if (file) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    previewAndSetDropItems(dataTransfer.files);
                }
            }
        }
    }

    export async function imgDropHandler(e) {
        e.preventDefault();
        draggedOver = false;
        let files = e.dataTransfer?.files;
        if (files) {
            previewAndSetDropItems(files);
        }
    }
</script>

<div
    class="drop {draggedOver === true ? 'dragover' : ''}"
    role="group"
    on:dragstart|preventDefault
    on:dragover|preventDefault={(e) => {
        draggedOver = true;
    }}
    on:dragenter={(e) => {
        draggedOver = true;
    }}
    on:dragleave={(e) => {
        draggedOver = false;
    }}
    on:drop={imgDropHandler}
    on:paste={handlePaste}
>
    {#each $dropItems as item (item.id)}
        <DropItem {item} />
    {/each}
</div>

<style>
    .drop {
        width: 100%;
        height: 100%;
        display: flex;
        flex-flow: row wrap;
        justify-content: start;
        align-content: start;
        align-items: start;
        gap: 1rem;
        padding: 2rem 1rem;
        overflow-y: auto;
    }

    .dragover {
        background-color: #55f5;
    }
</style>
