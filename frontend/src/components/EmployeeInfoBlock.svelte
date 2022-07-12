<script>
    export let employee;
    export let address;
</script>

<h2 class="font-bold text-lg">Personal info</h2>
<br/>
{#each Object.entries(employee) as [key, value]}
    <div class="pt-5">
        <h3 class="font-bold">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
        <p>{value}</p>
    </div>
{/each}
<div class="pt-5">
    <h3 class="font-bold">
        Address
    </h3>
    <p>{address.street}</p>
    <p>{address.zip}, {address.city}</p>
    <p>{address.country}</p>
</div>