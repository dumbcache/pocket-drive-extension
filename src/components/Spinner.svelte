<script>
    export let borderWidth = "2px";
    export let width = "2rem";
    export let height = "2rem";
</script>

<div
    class="spinner"
    style:border-width={borderWidth}
    style:width
    style:height
></div>

<style>
    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    .spinner {
        width: 5rem;
        height: 5rem;
        border: 5px solid var(--color);
        border-top: 5px solid var(--color-focus);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
</style>
