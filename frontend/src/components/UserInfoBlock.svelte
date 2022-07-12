<script>
    export let user;
</script>

<h2 class="text-lg font-bold">User info</h2>
<br/>
{#each Object.entries(user) as [key, value]}
    <div class="pt-5">
        <h3 class="font-bold">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
        {#if Array.isArray(value)}
            <ul>
                {#each value as val}
                    <li>{val}</li>
                {/each}
            </ul>
        {:else}
            <p>{value}</p>
        {/if}
    </div>
{/each}