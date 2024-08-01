<script>
    import { onMount } from "svelte";
    import closeIcon from "@assets/close.svg?raw";

    let images = [];
    let visible = false;

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            if (message.context === "IMAGES") {
                images = document.images;
                visible = true;
                return;
            }
        } catch (error) {
            console.warn("pocket-drive-extension:", error);
        }
    });
    onMount(() => {
        images = document.images;
        visible = true;
    });
</script>

{#if visible}
    <button on:click={() => (visible = false)}>{@html closeIcon}</button>
    <div class="wrapper">
        {#each images as image (image.src)}
            <img src={image.src} alt="" />
        {/each}
    </div>
{/if}

<style>
    .wrapper {
        background-color: #1115;
        backdrop-filter: blur(50px);
        padding: 1rem;
        width: 100%;
        height: 100%;
        position: fixed;
        right: 0;
        top: 0;
        display: flex;
        flex-flow: row wrap;
        justify-content: space-evenly;
        width: 350px;
        height: 95vh;
        overflow: auto;
        row-gap: 2rem;
    }
    img {
        width: 100px;
        max-height: 150px;
        object-fit: contain;
        border-radius: 5px;
    }

    button {
        color: inherit;
        width: 20px;
        height: 20px;
        position: fixed;
        top: 0;
        right: 0;
        padding: 0;
        margin: 0;
        border: none;
        background: none;
        outline: none;
        cursor: pointer;
        z-index: 1;
    }
    button :global(svg) {
        fill: #f00;
    }
    button:hover :global(svg) {
        fill: #f55;
    }
</style>
