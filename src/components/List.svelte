<script>
    import { onMount } from "svelte";
    import listIcon from "@assets/list.svg?raw";
    import historyIcon from "@assets/history.svg?raw";
    import downIcon from "@assets/down.svg?raw";
    import backIcon from "@assets/back.svg?raw";
    import refreshIcon from "@assets/refresh.svg?raw";
    import Spinner from "@components/Spinner.svelte";
    import { states } from "./scripts/stores.svelte";

    let listVisible = $state(false);
    let historyVisible = $state(true);
    let list = $state([]);
    let tempList = [];
    let refresh = $state(false);
    let spin = $state(false);
    let input = $state("");
    let inputElememt;
    export async function setFolders(parent, refresh) {
        const { status, error, data } = await chrome.runtime.sendMessage({
            context: "FOLDERS",
            parent,
            refresh,
        });
        if (status === 200) {
            list = data;
            tempList = data;
        }
    }

    function setStates(s) {
        states.selected = s;
        historyVisible || (historyVisible = true);
        listVisible || (listVisible = true);
    }

    async function setRootList() {
        let id = states.ROOT_ID;
        let name = states.ROOT_NAME;
        await setFolders(id);
        let s = { name, id };
        setStates(s);
        inputFocus();
    }

    async function setChildList(e) {
        if (!e.target) return;
        let { item } = e.target.dataset;
        const s = JSON.parse(item);
        if (!s.id) return;
        spin = true;
        await setFolders(s.id);
        setStates(s);
        spin = false;
        inputFocus();
    }

    async function setPreviouslist() {
        spin = true;
        const { status, data, error } = await chrome.runtime.sendMessage({
            context: "FETCH_SINGLE",
            id: states.selected.parents[0],
        });
        await setFolders(data?.id);
        setStates(data);
        spin = false;
        inputFocus();
    }

    async function setHistoryList() {
        const { active, recents } = await chrome.storage.local.get();
        let history = recents[active];
        if (!history) return;
        states.selected = history[0];
        list = history.slice(1);
        tempList = list;
        historyVisible && (historyVisible = false);
        listVisible || (listVisible = true);
        inputFocus();
    }

    async function refreshHandler() {
        refresh = true;
        await setFolders(states.selected.id, true);
        refresh = false;
    }

    function filterList(e) {
        e?.stopPropagation();
        list = tempList.filter((i) => {
            return i.name.toLowerCase().includes(input.toLowerCase());
        });
    }

    function inputFocus() {
        setTimeout(() => inputElememt?.focus());
        input = "";
    }

    function selectedHandler() {
        listVisible = !listVisible;
        setTimeout(() => inputElememt?.focus());
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        let { context, data } = message;
        if (context === "CREATE") {
            if (data) {
                list = data;
                tempList = data;
                inputElememt.focus();
                filterList();
            }
        }
    });

    async function init() {
        let { active, recents } = await chrome.storage.local.get();
        if (active) {
            recents ??= {};
            // states.ROOT_ID = roots[active];
            let history = recents[active];
            if (history?.length > 0) {
                states.selected = history.shift();
                list = history;
                return;
            }

            states.selected = { name: states.ROOT_NAME, id: states.ROOT_ID };
        }
    }
    onMount(init);
</script>

<svelte:window on:click={() => (listVisible = false)} />

<section class="selection">
    <button class="btn s-prime list" title="root folders" onclick={setRootList}
        >{@html listIcon}</button
    >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="wrapper">
        <button
            class="selected"
            title={states.selected?.name}
            onclick={selectedHandler}
        >
            {states.selected?.name}
        </button>
        {#if spin}
            <span class="spin">
                <Spinner width="1rem" height="1rem" />
            </span>
        {/if}
        {#if states.selected?.id !== states.ROOT_ID}
            <button class="btn s-second back" onclick={setPreviouslist}
                >{@html backIcon}</button
            >
        {/if}
        {#if historyVisible}
            <button class="btn s-second history" onclick={setHistoryList}
                >{@html historyIcon}</button
            >
        {:else}
            <button
                class="btn s-second history"
                onclick={async () => {
                    spin = true;
                    await setFolders(states.selected.id);
                    setStates(states.selected);
                    spin = false;
                }}>{@html downIcon}</button
            >
        {/if}

        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <ul
            style:display={listVisible ? "initial" : "none"}
            onclick={setChildList}
        >
            <input
                type="search"
                placeholder="search"
                bind:value={input}
                bind:this={inputElememt}
                onclick={(e) => e.stopPropagation()}
                oninput={filterList}
            />
            {#each list as item}
                <li title={item?.name} data-item={JSON.stringify(item)}>
                    {item?.name}
                </li>
            {/each}
        </ul>
    </div>
    <button
        class="btn s-prime"
        class:refresh
        onclick={refreshHandler}
        title="refresh selected folder">{@html refreshIcon}</button
    >
</section>

<style>
    .selection {
        font-size: var(--size-small);
        position: relative;
        max-width: 22rem;
        flex-grow: 1;
        display: flex;
        gap: 1rem;
        align-items: center;
    }
    .wrapper {
        width: 100%;
        position: relative;
        /* border-bottom: 1px solid var(--color-focus); */
        background-color: var(--bg-color-one);
    }
    .selected {
        display: inline-block;
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        cursor: pointer;
        min-height: 2.5rem;
        padding: 0.7rem 3.5rem 0.5rem 0.5rem;
        width: 16rem;
        text-align: start;
    }
    .selected:hover {
        background-color: var(--bg-color-two);
    }
    ul {
        position: absolute;
        left: 0;
        top: 3rem;
        background: inherit;
        width: 100%;
        background: inherit;
        /* background-color: var(--bg-color-two); */
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        max-height: 67rem;
        overflow-y: scroll;
        z-index: 1;
    }

    input {
        position: sticky;
        top: 0rem;
        padding: 0.7rem 0.5rem;
        width: 100%;
        background-color: var(--bg-color-two);
    }
    li {
        list-style: none;
        padding: 0.7rem 0.5rem;
        /* background-color: var(--bg-color-two); */
    }
    li:hover {
        background-color: var(--bg-color-two);
    }

    .selected,
    li {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        user-select: none;
    }

    .btn {
        flex-shrink: 0;
    }

    .history,
    .back,
    .spin {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translate(0, -50%);
    }

    .back {
        right: 2rem;
    }

    .spin {
        right: 4.5rem;
    }
    .back :global(svg) {
        fill: var(--color-one);
    }
    .back:hover :global(svg) {
        fill: var(--color-focus);
    }
    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    .refresh {
        animation: spin 1s infinite linear;
    }
</style>
