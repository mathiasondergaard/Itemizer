<script context="module">
    export async function load({fetch}) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/token/verify', {credentials: "include"});

            if (response.status !== 200) {
                return {
                    status: 302,
                    redirect: "/login"
                };
            }
        } catch (e) {
            return {
                status: 302,
                redirect: "/login"
            };
        }

        const res = await fetch('http://localhost:3000/api/resources/inventory/items', {credentials: "include"});
        const data = await res.json();
        if (res.status !== 200) {
            console.error(`${data.message}`);
        }
        return {props: {invItems: data}};
    }
</script>

<script>
    import {onMount} from "svelte";
    import {del, patch, post, put} from "$lib/api";
    import {getNotificationsContext} from 'svelte-notifications';
    import {handleResponse} from "$lib/handleResponse";
    import {LightPaginationNav, paginate} from "svelte-paginate";
    import {options} from "$lib/toaster";
    import {download} from "$lib/fileDownload";
    import io from "socket.io-client";

    const {addNotification} = getNotificationsContext();

    export let invItems;

    const connectSocket = () => {
        return io("http://localhost:3000", {
            withCredentials: true,
            transports: ['websocket', 'polling', 'flashsocket'],
            upgrade: false,
        });
    };

    let items = [];

    //Runs after component is rendered to DOM, controls lifecycle of component.
    onMount(async () => {
        items = invItems;
    });

    const socket = connectSocket();

    socket.on('connect', () => {
        console.log('Socket connection established');
    });

    socket.on('no-token', (data) => {
        console.error(data);
    });

    socket.on('invalid-token', (data) => {
        console.error(data);
    });

    socket.on('inventory-poll', (data) => {
        items = data;
    });

    socket.on('updated-item-location', (data) => {
        let index = items.map((x) => {return x.id;}).indexOf(parseInt(data.id));
        items[index].location = data.location;
        items[index].lastUpdatedBy = data.lastUpdatedBy;
    });

    socket.on('updated-item-stock', (data) => {
        let index = items.map((x) => {return x.id;}).indexOf(parseInt(data.id));
        items[index].stock = data.stock;
        items[index].status = data.status;
        items[index].lastUpdatedBy = data.lastUpdatedBy;
    });

    socket.on('updated-stock-bulk', (data) => {
        data.forEach(i => {
            let index = items.indexOf(items.find(x => x.SKU === i.SKU));
            items[index].stock = i.stock;
            items[index].status = i.status;
            items[index].lastUpdatedBy = i.lastUpdatedBy;
        });
    });

    socket.on('created-items-bulk', (data) => {
        items.push(...data);
        items = items;
    });

    socket.on('created-item', (data) => {
        items = [...items, data];
    });

    socket.on('deleted-item', (data) => {
        addNotification(options(data, 'warning'));
    });

    socket.on('updated-item', (data) => {
        let index = items.map((x) => {return x.id;}).indexOf(parseInt(data.id));
        items[index].name = data.name;
        items[index].SKU = data.SKU;
        items[index].stock = data.stock;
        items[index].status = data.status;
        items[index].threshold = data.threshold;
        items[index].lastUpdatedBy = data.lastUpdatedBy;
    });


    //Pagination options
    let currentPage = 1;
    let pageSize = 8;
    $: paginatedItems = paginate({items, pageSize, currentPage});

    // Empty objects for handle functions
    let locationUpdate = {
        location: '',
    };

    let stockUpdate = {
        stock: 0,
        note: '',
    };

    let itemToCreate = {
        name: '',
        SKU: '',
        stock: 0,
        threshold: 0,
        location: '',
    };

    let exportListWithAttributes = {
        attributes: [],
    };
    let exportPickedList = {
        attributes: [],
        SKUs: [],
    };

    let files;

    const handleDelete = async (item) => {
        let index = items.indexOf(item);
        const response = await del(`/resources/inventory/items/${item.id}`);

        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(`Successfully deleted item ${item.id}`, 'success'));
            items.splice(index, 1);
            items = items;
        }
    };

    const updateStock = async (item) => {
        const response = await patch(`/resources/inventory/items/${item.id}/stock`, stockUpdate);
        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
        }
    };

    const updateLocation = async (item) => {
        const response = await patch(`/resources/inventory/items/${item.id}/location`, locationUpdate);
        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
        }
    };

    const createItem = async () => {
        const response = await post(`/resources/inventory/items`, itemToCreate);
        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options('Item successfully created!', 'success'));
        }
    };

    const updateItem = async (item) => {
        const response = await put(`/resources/inventory/items/${item.id}`, itemToCreate);
        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(`Item ${item.id} successfully updated!`, 'success'));
        }
    };

    const downloadTemplate = async () => {
        const response = await fetch('http://localhost:3000/api/resources/inventory/download/template', {credentials: 'include'});
        if (response.status !== 200) {
            const resp = {
                status: response.status,
                data: await response.json(),
            }
            return handleResponse(resp, addNotification);
        }
        addNotification(options(`Successfully downloaded template!`, 'success'));
        const blob = await response.blob();
        return download(blob, 'item-create-template.xlsx');
    };

    const downloadFullInventoryList = async () => {
        const response = await fetch('http://localhost:3000/api/resources/inventory/download/full-list', {credentials: 'include'});
        if (response.status !== 200) {
            const resp = {
                status: response.status,
                data: await response.json(),
            }
            return handleResponse(resp, addNotification);
        }
        addNotification(options(`Successfully downloaded full inventory list!`, 'success'));
        const blob = await response.blob();
        return download(blob, 'full-inventory-list.csv');
    };

    const downloadPickedInventoryList = async () => {
        if (!exportPickedList.attributes || !exportPickedList.SKUs) {
            addNotification(options(`Please provide attributes/items!`, 'warning'));
        }
        const response = await fetch('http://localhost:3000/api/resources/inventory/download/picked-list', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(exportPickedList),
            credentials: 'include'
        });
        if (response.status !== 200) {
            const resp = {
                status: response.status,
                data: await response.json(),
            }
            return handleResponse(resp, addNotification);
        }
        addNotification(options(`Successfully downloaded picked inventory list!`, 'success'));
        exportPickedList.attributes = [];
        exportListWithAttributes.SKUs = [];
        const blob = await response.blob();
        return download(blob, 'picked-inventory-list.csv');
    };

    const downloadFullInventoryWithAttributes = async () => {
        if (!exportListWithAttributes.attributes) {
            addNotification(options(`Please provide attributes!`, 'warning'));
        }
        const response = await fetch('http://localhost:3000/api/resources/inventory/download/picked-attributes', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(exportListWithAttributes),
            credentials: 'include'
        });
        if (response.status !== 200) {
            const resp = {
                status: response.status,
                data: await response.json(),
            }
            return handleResponse(resp, addNotification);
        }
        addNotification(options(`Successfully downloaded inventory list with attributes: ${exportListWithAttributes.attributes.toString()}!`, 'success'));
        const blob = await response.blob();
        exportListWithAttributes.attributes = [];
        return download(blob, 'inventory-list.csv');
    };

    const importInventoryList = async () => {
        if (files === null) {
            files = null;
            addNotification(options(`Please upload a file!`, 'warning'));
        }
        const body = new FormData();
        body.append('inventory-list', files[0]);
        const response = await fetch('http://localhost:3000/api/resources/inventory/upload/list', {
            method: "POST",
            body: body,
            credentials: 'include'
        });
        const data = await response.json();
        if (response.status !== 200) {
            files = null;
            return handleResponse({status: response.status, data: data}, addNotification);
        }
        addNotification(options(`Successfully imported inventory list!`, 'success'));
    };

    const importStockUpdate = async () => {
        if (files === undefined) {
            files = null;
            addNotification(options(`Please upload a file!`, 'warning'));
        }
        const body = new FormData();
        body.append('stock-list', files[0]);
        const response = await fetch('http://localhost:3000/api/resources/inventory/upload/stock', {
            method: "PUT",
            body: body,
            credentials: 'include'
        });

        if (response.status !== 200) {
            files = null;
            return handleResponse({status: response.status, data: await response.json()}, addNotification);
        }
        addNotification(options(`Successfully updated stock by file!`, 'success'));
        files = null;
    };

    const showByStatus = (status) => {
        const newItems = [];
        invItems.forEach(item => {
            if (item.status === status) {
                newItems.push(item)
            }
        });
        return items = newItems.sort((a, b) => a.id - b.id);
    };

    const statusSortOrder = ['HEALTHY', 'CAUTION', 'CRITICAL'];
    const attributes = ['ID', 'Name', 'SKU', 'Stock', 'Status', 'Threshold', 'Location', 'Updated By'];
    const SKUs = invItems.map(i => { return i.SKU});

    let search = undefined;
    $: paginatedItems = search ?
        items.filter(i => {
            return i.SKU.match(`${search}.*`)
        }) : paginate({items, pageSize, currentPage});

</script>

<svelte:head>
    <title>Inventory</title>
</svelte:head>

<div class="flex mx-auto justify-start pl-20 pt-20">
    <h1 class=" title-font font-bold text-2xl">Inventory List</h1>
</div>

<section class="pt-5">
    <div class="container mx-auto flex flex-wrap p-8 rounded-box w-full">
        <label class="label">
            <span class="label-text font-bold">Show by: </span>
        </label>
        <div class="dropdown">
            <label tabindex="0" class="btn m-1 btn-sm btn-outline">
                Status
                <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                </svg>
            </label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                    <button class="btn-sm" on:click={() => {
                            items = invItems;
                        }}>ALL
                    </button>
                </li>
                {#each statusSortOrder as status}
                    <li>
                        <button class="btn-sm" on:click={() => {
                            showByStatus(status);
                        }}>{status}
                        </button>
                    </li>
                {/each}
            </ul>
        </div>

        <div class="grid w-full">
            <div class="flow-root">
                <div class="pb-2 justify-end float-right">
                    <div class="btn-group">
                        <div class="">
                            <label for="import" class="btn btn-ghost btn-md btn-outline">Import</label>
                            <input type="checkbox" id="import" class="modal-toggle" />
                            <label for="import" class="modal cursor-pointer">
                                <label class="modal-box relative">
                                    <h2 class="text-lg font-bold">Import to Inventory</h2>
                                        <div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">Import inventory list </h3>
                                                <div class="pt-1">
                                                <input bind:files id="inv-list-import" type="file" accept=".csv" class="block w-2/3 text-sm border cursor-pointer" />
                                                </div>
                                                    <div class="pt-2">
                                                    <button on:click={() => {
                                                        importInventoryList();
                                                        const input = document.getElementById("inv-list-import");
                                                        input.value = null;
                                                    }}
                                                            class="btn btn-ghost btn-sm btn-outline">Upload
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">Import stock updates</h3>
                                                <div class="pt-1">
                                                <input bind:files id="stock-import" type="file" accept=".csv" class="block w-2/3 text-sm rounded-lg border cursor-pointer" />
                                                </div>
                                                    <div class="pt-2">
                                                    <button on:click={() => {
                                                        importStockUpdate();
                                                        const input = document.getElementById("stock-import");
                                                        input.value = null;
                                                    }}
                                                            class="btn btn-ghost btn-sm btn-outline">Upload
                                                    </button>
                                                </div>
                                            </div>
                                    </div>
                                </label>
                            </label>
                        </div>

                        <div class="px-2">
                            <label for="export" class="btn btn-ghost btn-md btn-outline">Export</label>
                            <input type="checkbox" id="export" class="modal-toggle" />
                            <label for="export" class="modal cursor-pointer">
                                <label class="modal-box relative">
                                    <h2 class="text-lg font-bold">Export from Inventory</h2>
                                        <div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">Full inventory list</h3>
                                                <div class="pt-1">
                                                    <button on:click={() => {downloadFullInventoryList()}}
                                                            class="btn btn-ghost btn-sm btn-outline">Download
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">Full inventory with attributes</h3>
                                                <label class="label">
                                                    <span class="label-text">Use CTRL/CMD to select multiple</span>
                                                </label>
                                                <select class="select select-sm select-bordered w-2/4 h-2/4" multiple bind:value={exportListWithAttributes.attributes}>
                                                    {#each attributes as attribute}
                                                        <option value={attribute.toLowerCase()}>
                                                            {attribute}
                                                        </option>
                                                    {/each}
                                                </select>
                                                <div class="pt-1">
                                                    <button on:click={() => {downloadFullInventoryWithAttributes()}}
                                                            class="btn btn-ghost btn-sm btn-outline">Download
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">Full inventory with attributes</h3>
                                                <label class="label">
                                                    <span class="label-text">Use CTRL/CMD to select multiple</span>
                                                </label>
                                                <div class="">
                                                    <label class="label">
                                                        <span class="label-text font-bold">Attributes</span>
                                                    </label>
                                                    <select class="select select-sm select-bordered w-2/4 h-2/4" multiple bind:value={exportPickedList.attributes}>
                                                        {#each attributes as attribute}
                                                            <option value={attribute.toLowerCase()}>
                                                                {attribute}
                                                            </option>
                                                        {/each}
                                                    </select>
                                                    <label class="label">
                                                        <span class="label-text font-bold">SKUs</span>
                                                    </label>
                                                    <select class="select select-sm select-bordered w-2/4 h-56" multiple bind:value={exportPickedList.SKUs}>
                                                        {#each SKUs as SKU}
                                                            <option value={SKU}>
                                                                {SKU}
                                                            </option>
                                                        {/each}
                                                    </select>
                                                </div>
                                                <div class="pt-1">
                                                    <button on:click={() => {downloadPickedInventoryList()}} class="btn btn-ghost btn-sm btn-outline">Download</button>
                                                </div>
                                            </div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">Template for import</h3>
                                                <div class="pt-1">
                                                    <button on:click={() => {downloadTemplate();}} class="btn btn-ghost btn-sm btn-outline">Download</button>
                                                </div>
                                            </div>
                                        </div>
                                </label>
                            </label>
                        </div>

                        <div>
                            <label for="addItem" class="btn btn-ghost btn-md btn-outline">Add Item</label>
                            <input type="checkbox" id="addItem" class="modal-toggle" />
                            <label for="addItem" class="modal cursor-pointer">
                                <label class="modal-box relative">
                                    <h2 class="text-lg font-bold">Add Item</h2>
                                    <div class="grid grid-cols-3 gap-3 w-full">
                                        <div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">Name</h3>
                                                <input bind:value={itemToCreate.name} type="text" placeholder="Material X" class="input input-sm input-bordered max-w-sm" />
                                            </div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">SKU</h3>
                                                <input bind:value={itemToCreate.SKU} type="text" placeholder="SKU-123" class="input input-sm input-bordered max-w-sm" />
                                            </div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">Stock</h3>
                                                <input bind:value={itemToCreate.stock} type="number" placeholder="50" class="input input-sm input-bordered max-w-sm" />
                                            </div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">
                                                    Threshold
                                                </h3>
                                                <input bind:value={itemToCreate.threshold} type="number" placeholder="50" class="input input-sm input-bordered max-w-sm" />
                                            </div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">
                                                    Location
                                                </h3>
                                                <input bind:value={itemToCreate.location} type="text" placeholder="TR-5" class="input input-sm input-bordered max-w-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-actions pt-5 justify-end">
                                        <button class="btn btn-ghost btn-sm btn-outline" on:click={() => {createItem()}}>Submit</button>
                                    </div>
                                </label>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="pb-2 float-left">
                    <label class="label label-text font-bold" for="filter">
                        Search
                    </label>
                    <input type="search" placeholder="Type a SKU" id="filter" bind:value={search} class="input input-sm input-bordered max-w-xs"/>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="table table-zebra" id="myTable">
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
                                    Name
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.name.localeCompare(b.name))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.name.localeCompare(b.name)).reverse()}
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
                                    Stock
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.stock - b.stock)}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.stock - b.stock).reverse()}
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
                                    Status
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => statusSortOrder.indexOf(a.status) - statusSortOrder.indexOf(b.status))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => statusSortOrder.indexOf(a.status) - statusSortOrder.indexOf(b.status)).reverse()}
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
                                    Threshold
                                    <br>
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.threshold - b.threshold)}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.threshold - b.threshold).reverse()}
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
                                    Location
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.location.localeCompare(b.location))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.location.localeCompare(b.location)).reverse()}
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
                                    Last Updated By
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.lastUpdatedBy - b.lastUpdatedBy)}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.lastUpdatedBy - b.lastUpdatedBy).reverse()}
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
                    {#each paginatedItems as item}
                        <tr>
                            <td class="center">{item.id}</td>
                            <td class="center">{item.SKU}</td>
                            <td class="center">{item.name}</td>
                            <td class="center">
                                <label for="{item.SKU}" class="btn btn-ghost btn-sm btn-outline">{item.stock}</label>
                                <input type="checkbox" id="{item.SKU}" class="modal-toggle" />
                                <label for="{item.SKU}" class="modal cursor-pointer">
                                    <label class="modal-box relative">
                                        <h3 class="text-lg font-bold">Update stock of {item.SKU}</h3>
                                        <div class="py-5">
                                            <div>
                                                <h3 class="font-bold">New Stock:</h3>
                                                <div class="pt-2">
                                                    <input type="text" id="stock-update"
                                                           placeholder="Old stock: {item.stock}" bind:value={stockUpdate.stock}
                                                           class="input pt-2 input-sm input-bordered w-36 max-w-xs"/>
                                                </div>
                                            </div>
                                            <div class="pt-5">
                                                <h3 class="font-bold">Note</h3>
                                                <div class="pt-2">
                                                    <textarea bind:value={stockUpdate.note} class="textarea textarea-bordered h-32 w-2/3" maxlength="250" placeholder="A note for logging if you have any.. else leave blank"></textarea>
                                                </div>
                                            </div>
                                        </div>
                                            <button on:click={() => {
                                                updateStock(item);
                                                const input = document.getElementById("stock-update");
                                                input.value = null;
                                            }} class="btn-success btn btn-sm btn-ghost btn-outline">Submit</button>
                                    </label>
                                </label>
                            </td>
                            {#if item.status === 'CAUTION'}
                                <td style="background: yellow" class="center">{item.status}</td>
                            {:else if item.status === 'CRITICAL'}
                                <td style="background: red" class="center">{item.status}</td>
                            {:else}
                                <td style="background: lawngreen" class="center">{item.status}</td>
                            {/if}

                            <td class="center">
                                {item.threshold}
                            </td>
                            <td class="center">
                                <label for="{item.id}" class="btn btn-ghost btn-sm btn-outline">{item.location}</label>
                                <input type="checkbox" id="{item.id}" class="modal-toggle" />
                                <label for="{item.id}" class="modal cursor-pointer">
                                    <label class="modal-box relative">
                                        <h3 class="text-lg font-bold">Update location of {item.SKU}</h3>
                                            <div class="py-5">
                                                <h3 class="font-bold">New location:</h3>
                                                <div class="pt-2">
                                                    <input type="text" bind:value={locationUpdate.location}
                                                           placeholder="Old location: {item.location}"
                                                           class="input pt-2 input-sm input-bordered w-44 max-w-xs"/>
                                                </div>
                                            </div>
                                            <button on:click={() => {updateLocation(item)}} class="btn-success btn btn-sm btn-ghost btn-outline">Submit</button>
                                    </label>
                                </label>
                            </td>
                            <td class="center">
                                {#if item.lastUpdatedBy === 0}
                                    Polling
                                {:else if !item.lastUpdatedBy}
                                    No Data
                                {:else}
                                    {item.lastUpdatedBy}
                                {/if}
                            </td>
                            <td>
                                <label for="{item.id + 200000}" class="btn btn-ghost btn-sm btn-outline">Details</label>
                                <input type="checkbox" id="{item.id + 200000}" class="modal-toggle" />
                                <label for="{item.id + 200000}" class="modal cursor-pointer">
                                    <label class="modal-box relative">
                                        <h2 class="text-lg font-bold">Viewing {item.name}</h2>
                                                    <div class="pt-5 ">
                                                        <h3 class="font-bold">ID</h3>
                                                        <p>{item.id}</p>
                                                    </div>
                                                    <div class="pt-5">
                                                        <h3 class="font-bold">Name</h3>
                                                        <p>{item.name}</p>
                                                    </div>
                                                    <div class="pt-5">
                                                        <h3 class="font-bold">SKU</h3>
                                                        <p>{item.SKU}</p>
                                                    </div>
                                                    <div class="pt-5">
                                                        <h3 class="font-bold">Stock</h3>
                                                        <p>{item.stock}</p>
                                                    </div>
                                                    <div class="pt-5">
                                                        <h3 class="font-bold">Status</h3>
                                                        <p>{item.status}</p>
                                                    </div>
                                                    <div class="pt-5">
                                                        <h3 class="font-bold">Threshold</h3>
                                                        <p>{item.threshold}</p>
                                                    </div>
                                                    <div class="pt-5">
                                                        <h3 class="font-bold">Last Updated By</h3>
                                                        <p>
                                                            {#if item.lastUpdatedBy === 0}
                                                                Polling
                                                            {:else if !item.lastUpdatedBy}
                                                                No Data
                                                            {:else}
                                                                {item.lastUpdatedBy}
                                                            {/if}
                                                        </p>
                                                    </div>
                                        <div class="card-actions pt-5 justify-end">
                                            <button class="btn btn-ghost btn-sm btn-outline" on:click={() => handleDelete(item)}>Delete</button>
                                        </div>
                                    </label>
                                </label>
                                <label for="{item.id + 100000}" class="btn btn-ghost btn-sm btn-outline">Edit</label>
                                <input type="checkbox" id="{item.id + 100000}" class="modal-toggle" />
                                <label for="{item.id + 100000}" class="modal cursor-pointer">
                                    <label class="modal-box relative">
                                        <h2 class="text-lg font-bold">Edit Item {item.id}</h2>
                                        <div class="grid grid-cols-3 gap-3 w-full">
                                            <div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Name</h3>
                                                    <input bind:value={itemToCreate.name} type="text" placeholder="Old name: {item.name}" class="input input-sm input-bordered max-w-sm" />
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">SKU</h3>
                                                    <input bind:value={itemToCreate.SKU} type="text" placeholder="Old SKU: {item.SKU}" class="input input-sm input-bordered max-w-sm" />
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Stock</h3>
                                                    <input bind:value={itemToCreate.stock} type="number" placeholder="Old Stock: {item.stock}" class="input input-sm input-bordered max-w-sm" />
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">
                                                        Threshold
                                                    </h3>
                                                    <input bind:value={itemToCreate.threshold} type="number" placeholder="Old Threshold: {item.threshold}" class="input input-sm input-bordered max-w-sm" />
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">
                                                        Location
                                                    </h3>
                                                    <input bind:value={itemToCreate.location} type="text" placeholder="Old Location: {item.location}" class="input input-sm input-bordered max-w-sm" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="card-actions pt-5 justify-end">
                                            <button class="btn btn-ghost btn-sm btn-outline" on:click={() => {updateItem(item)}}>Submit</button>
                                        </div>
                                    </label>
                                </label>
                                <button class="btn btn-sm btn-outline btn-ghost" on:click={handleDelete(item)}>
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
        </div>
    </div>
</section>



