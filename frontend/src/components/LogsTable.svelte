<script>
    import {LightPaginationNav, paginate} from "svelte-paginate";
    import {onMount} from "svelte";
    import {del} from "$lib/api";
    import {handleResponse} from "$lib/handleResponse";
    import {options} from "$lib/toaster";

    export let logs;
    export let addNotification;

    let items = [];

    onMount(async () => {
        items = logs;
    });

    //Pagination options for first table
    let currentPage = 1;
    let pageSize = 5;
    $: paginatedItems = paginate({items, pageSize, currentPage});

    const handleDelete = async (log) => {
        let index = items.indexOf(log);

        const response = await del(`/resources/inventory/logs/${log.id}`);

        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
            items.splice(index, 1);
            items = items;
        }
    };

    let search = undefined;
    $: paginatedItems = search ?
        items.filter(i => {
            return i.SKU.match(`${search}.*`)
        }) : paginate({items, pageSize, currentPage});

</script>

<div>
    <div class="pb-2">
        <label class="label label-text font-bold" for="filter">
            Search
        </label>
        <input type="search" id="filter" bind:value={search} class="input input-sm input-bordered max-w-xs"
               placeholder="Type a SKU"/>
    </div>
    <table class="table table-zebra">
        <thead>
        <tr>
            <th>
                <div class="dropdown">
                    <label tabindex="0" class="btn m-1 btn-xs btn-ghost">
                        ID
                        <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                             viewBox="0 0 24 24">
                            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                        </svg>
                    </label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.id - b.id) }>
                                ASCENDING
                            </button>
                        </li>
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.id - b.id).reverse() }>
                                DESCENDING
                            </button>
                        </li>
                    </ul>
                </div>
            </th>
            <th>
                <div class="dropdown">
                    <label tabindex="0" class="btn m-1 btn-xs btn-ghost">
                        SKU
                        <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                             viewBox="0 0 24 24">
                            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                        </svg>
                    </label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.SKU.localeCompare(b.SKU))}
                            >ASCENDING
                            </button>
                        </li>
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.SKU.localeCompare(b.SKU)).reverse()}
                            >DESCENDING
                            </button>
                        </li>
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.id - b.id) }>
                                DEFAULT
                            </button>
                        </li>
                    </ul>
                </div>
            </th>
            <th>
                <div class="dropdown">
                    <label tabindex="0" class="btn m-1 btn-xs btn-ghost">
                        Employee ID
                        <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                             viewBox="0 0 24 24">
                            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                        </svg>
                    </label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.employeeId - b.employeeId)}
                            >ASCENDING
                            </button>
                        </li>
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.employeeId - b.employeeId).reverse()}
                            >DESCENDING
                            </button>
                        </li>
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.id - b.id) }>
                                DEFAULT
                            </button>
                        </li>
                    </ul>
                </div>
            </th>
            <th>
                <div class="dropdown">
                    <label tabindex="0" class="btn m-1 btn-xs btn-ghost">
                        Quantity Changed
                        <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                             viewBox="0 0 24 24">
                            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                        </svg>
                    </label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.quantityChanged.localeCompare(b.quantityChanged))}
                            >ASCENDING
                            </button>
                        </li>
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.quantityChanged.localeCompare(b.quantityChanged)).reverse()}
                            >DESCENDING
                            </button>
                        </li>
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.id - b.id) }>
                                DEFAULT
                            </button>
                        </li>
                    </ul>
                </div>
            </th>
            <th class="content-center">
                <div class="dropdown">
                    <label tabindex="0" class="btn m-1 btn-xs btn-ghost">
                        Note
                        <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                             viewBox="0 0 24 24">
                            <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                        </svg>
                    </label>
                    <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.note.localeCompare(b.note))}
                            >ASCENDING
                            </button>
                        </li>
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.note.localeCompare(b.note)).reverse()}
                            >DESCENDING
                            </button>
                        </li>
                        <li>
                            <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.id - b.id) }>
                                DEFAULT
                            </button>
                        </li>
                    </ul>
                </div>
            </th>
            <th>Util</th>
        </tr>
        </thead>
        <tbody>
        {#each paginatedItems as log}
            <tr>
                <td>{log.id}</td>
                <td>{log.SKU}</td>
                <td>{log.employeeId}</td>
                <td>
                    {log.quantityChanged}
                </td>
                <td>
                    {#if !log.note}
                        No Data
                    {:else }
                        {log.note}
                    {/if}
                </td>
                <td>
                    <button class="btn btn-sm btn-outline btn-ghost" on:click={handleDelete(log)}>
                        Delete
                    </button>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
    <div class="btn-group nav pt-5">
        <LightPaginationNav
                totalItems="{items.length}"
                pageSize="{pageSize}"
                currentPage="{currentPage}"
                limit="{1}"
                showStepOptions="{true}"
                on:setPage="{(p) => currentPage = p.detail.page}"
        />
    </div>
</div>