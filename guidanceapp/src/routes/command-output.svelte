<script lang='ts'>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let id;
    export let prompt;
    let promptDetails = {
        commands: {
            ask: / ask( |$)/.test(prompt.detail.textContent),
            welcome: / welcome( |$)/.test(prompt.detail.textContent),
            about: / about( |$)/.test(prompt.detail.textContent),
            audio: / audio( |$)/.test(prompt.detail.textContent)
        },
        options: {
            help: / -h( |$)| --help( |$)/.test(prompt.detail.textContent),
            version: / -v( |$)| --version( |$)/.test(prompt.detail.textContent),
            plain: / -p( |$)| --plain( |$)/.test(prompt.detail.textContent),
            generate: / -g( |$)| --generate( |$)/.test(prompt.detail.textContent),
            library: / -l( |$)| --library( |$)/.test(prompt.detail.textContent)
        },
        promptText: prompt.detail.textContent.match(/(?<=").*(?=")/)
    };
    
    const dispatch = createEventDispatcher();
    onMount(() => {
        let rawPrompt = prompt.detail.textContent
        dispatch('mount', {})
        console.log(JSON.stringify(promptDetails))
    })
</script>
<div id={id}>
    hello<br><br>
</div>