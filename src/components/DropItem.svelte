<script lang="ts">
    import Spinner from "@components/Spinner.svelte";
    import doneIcon from "@assets/done.svg?raw";
    import cancelIcon from "@assets/close.svg?raw";
    import { onMount } from "svelte";
    import { save } from "@components/scripts/utils.js";
    import { dropStore } from "./scripts/stores.svelte";

    let { item } = $props<DropItem>();
    let element;

    async function doneHandler() {
        save(item);
    }

    function cancelHandler() {
        // let index = dropStore.items.findIndex((i) => i.id !== item.id);
        // dropStore.items.splice(index, 1);
        dropStore.items = dropStore.items.filter((i) => i.id !== item.id);
    }

    onMount(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
    });
</script>

<div class="drop-item" data-id={item.id} bind:this={element}>
    {#if item?.mimeType?.match("image/")}
        <img src={item?.imgRef} class="drop-img" alt="" />
    {:else if item?.mimeType?.match("video/")}
        <video src={item?.imgRef} muted class="drop-img"></video>
    {/if}
    <span class="name" title={item?.name}>{item?.displayName}</span>
    {#if item?.status === "" && item.loaded === true}
        <button class="s-prime btn done" on:click={doneHandler}
            >{@html doneIcon}</button
        >
        <button class="s-prime btn cancel" on:click={cancelHandler}
            >{@html cancelIcon}</button
        >
    {:else}
        <div class="status">
            {#if item?.status === "uploading"}
                <div class="spinner-wrapper">
                    <Spinner height={"3rem"} width={"3rem"} />
                    <p class="progress-count"></p>
                </div>
            {:else if item?.status === "success"}
                <span class="s-prime success">{@html doneIcon}</span>
            {/if}
        </div>
    {/if}
</div>

<style>
    .drop-item {
        width: 1000%;
        max-width: 14rem;
        position: relative;
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
        overflow: hidden;
    }
    .drop-item:hover img {
        filter: brightness(0.7);
    }
    .drop-item:hover button {
        display: initial;
    }
    .drop-img {
        width: 100%;
        max-height: 20rem;
        object-fit: contain;
        object-position: center;
    }

    button {
        display: none;
        position: absolute;
        top: 0rem;
    }
    .done {
        right: 0rem;
    }
    .cancel {
        left: 0rem;
    }

    .status {
        display: grid;
        height: 100%;
        width: 100%;
        place-content: center;
        place-items: center;
        position: absolute;
        top: 0;
        background-color: #0008;
    }

    .success :global(svg) {
        fill: var(--color-green);
    }

    .name {
        position: absolute;
        bottom: 0;
        left: 0;
        font-size: var(--size-smallest);
        background-color: #0008;
        padding: 0.5rem;
        width: 100%;
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .spinner-wrapper {
        position: relative;
    }
    .progress-count {
        font-size: var(--size-smallest);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>
