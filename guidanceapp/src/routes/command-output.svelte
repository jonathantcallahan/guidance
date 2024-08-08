<script lang='ts'>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let id;

    const dispatch = createEventDispatcher();
    onMount(() => {
        dispatch('mount', {})
    })
</script>
<div id={id}>
    hello<br><br>
</div>