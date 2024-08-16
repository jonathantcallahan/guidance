<script lang='ts'>

    export let loadingText;
    export let queryLoading = true;

    const loadingChars = ['⠁','⠂','⠄','⡀','⢀','⠠','⠐','⠈']
    let activeCharOffset = 0
    setInterval(() => {
        activeCharOffset = (activeCharOffset + 1) % loadingChars.length 
    }, 75)
    
    
</script>

<div>
    <div>
        {#each {length: 8} as _, i}
            <span>{loadingChars[queryLoading ? (i + activeCharOffset) % loadingChars.length : 1]}</span>
        {/each}
        <span>{loadingText}</span>
    </div>
</div>