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

        const res = await fetch('http://localhost:3000/api/resources/tasks', {credentials: "include"});
        const data = await res.json();
        if (res.status !== 200) {
            console.error(`${data.message}`);
        }

        const empRes = await fetch('http://localhost:3000/api/resources/employees/property/names', {credentials: "include"});
        const empData = await empRes.json();
        if (empRes.status !== 200) {
            console.error(`${empData.message}`);
        }

        return {props: {tasks: data, employees: empData}};
    }
</script>

<script>
    import {onMount} from "svelte";
    import {del, patch, post, put} from "$lib/api";
    import {getNotificationsContext} from 'svelte-notifications';
    import {handleResponse} from "$lib/handleResponse";
    import {LightPaginationNav, paginate} from "svelte-paginate";
    import {options} from "$lib/toaster";
    import {formatDateString} from "$lib/formatDate";

    const {addNotification} = getNotificationsContext();

    export let tasks;
    export let employees;

    let items = [];

    //Runs after component is rendered to DOM, controls lifecycle of component.
    onMount(async () => {
        items = tasks;
    });

    //Pagination options
    let currentPage = 1;
    let pageSize = 8;
    $: paginatedItems = paginate({items, pageSize, currentPage});

    //Objects for funcs

    const taskToUpdate = {
        name: '',
        description: '',
        level: '',
        status: '',
        startedAt: Date,
        completedAt: Date,
        assignedEmployees: []
    };

    const taskToCreate = {
        name: '',
        description: '',
        level: '',
        assignedEmployees: []
    };

    const handleDelete = async (task) => {
        let index = items.indexOf(task);

        const response = await del(`/resources/tasks/${task.id}`);

        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
            items.splice(index, 1);
            items = items;
        }
    };

    const showByStatus = (status) => {
        const newItems = [];
        tasks.forEach(item => {
            if (item.status === status) {
                newItems.push(item)
            }
        });
        return items = newItems.sort((a, b) => a.id - b.id);
    };

    const showByLevel = (level) => {
        const newItems = [];
        tasks.forEach(item => {
            if (item.level === level) {
                newItems.push(item)
            }
        });
        return items = newItems.sort((a, b) => a.id - b.id);
    };

    const startTask = async (task) => {
        const response = await patch(`/resources/tasks/${task.id}/start`);
        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
            let i = items.indexOf(task);
            items[i].startedAt = response.data.date;
            items[i].status = response.data.status;
        }
    };

    const editTask = async (task) => {
        const response = await put(`/resources/tasks/${task.id}`, taskToUpdate);

        const handled = handleResponse(response, addNotification);

        if (handled) {
            addNotification(options(`Successfully updated task ${task.id}`, 'success'));
            let i = items.indexOf(task);
            console.log(response.data);
            items[i].name = response.data.name;
            items[i].description = response.data.description;
            items[i].level = response.data.level;
            items[i].status = response.data.status;
            items[i].startedAt = response.data.startedAt;
            items[i].completedAt = response.data.completedAt;
            items[i].assignedEmployees = response.data.assignedEmployees;
        }
    };

    const updateLevel = async (task, level) => {
        const response = await patch(`/resources/tasks/${task.id}/level/${level}`);
        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
            let i = items.indexOf(task);
            items[i].level = level;
        }
    };

    const createTask = async () => {
        const response = await post('/resources/tasks', taskToCreate);

        const handled = handleResponse(response, addNotification);

        if (handled) {
            addNotification(options('Successfully created task!', 'success'));
            items = [...items, response.data];
        }
    };

    const updateStatus = async (task, status) => {
        const response = await patch(`/resources/tasks/${task.id}/status/${status}`);
        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
            let i = items.indexOf(task);
            items[i].status = status;
        }
    };

    const completeTask = async (task) => {
        const response = await patch(`/resources/tasks/${task.id}/complete`);
        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
            let i = items.indexOf(task);
            items[i].completedAt = response.data.date;
            items[i].status = response.data.status;
        }
    };

    const levelSortOrder = ['LOW', 'MEDIUM', 'HIGH'];
    const statusSortOrder = ['NOT-STARTED', 'ON-GOING', 'COMPLETED', 'POSTPONED'];

    let search = undefined;
    $: paginatedItems = search ?
        items.filter(i => {
            return i.name.match(`${search}.*`)
        }) : paginate({items, pageSize, currentPage});

</script>

<svelte:head>
    <title>Tasks</title>
</svelte:head>

<div class="flex mx-auto justify-start pl-20 pt-20">
    <h1 class=" title-font font-bold text-2xl">Tasks</h1>
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
                            items = tasks;
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
        <div class="dropdown">
            <label tabindex="0" class="btn m-1 btn-sm btn-outline">
                Priority
                <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                </svg>
            </label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                    <button class="btn-sm" on:click={() => {
                            items = tasks;
                        }}>ALL
                    </button>
                </li>
                {#each levelSortOrder as level}
                    <li>
                        <button class="btn-sm" on:click={() => {
                            showByLevel(level);
                        }}>{level}
                        </button>
                    </li>
                {/each}
            </ul>
        </div>

        <div class="grid w-full">
            <div class="flow-root">
                <div class="pb-2 justify-end float-right">
                    <label for="addItem" class="btn btn-ghost btn-md btn-outline">Add Task</label>
                    <input type="checkbox" id="addItem" class="modal-toggle" />
                    <label for="addItem" class="modal cursor-pointer">
                        <label class="modal-box relative">
                            <h2 class="text-lg font-bold">Add Task</h2>
                            <div class="pt-5">
                                <h3 class="font-bold">Name</h3>
                                <input bind:value={taskToCreate.name} type="text" placeholder="Order X of Item" class="input input-sm input-bordered max-w-sm" />
                            </div>
                            <div class="pt-5">
                                <h3 class="font-bold">Description</h3>
                                <textarea bind:value={taskToCreate.description} class="textarea w-full textarea-bordered h-48" maxlength="250" placeholder="A brief description of what to do/solve"></textarea>
                                <label class="label">
                                    <span class="label-text-alt">Characters remaining: {250 - taskToCreate.description.length}</span>
                                </label>
                            </div>
                            <div class="pt-5 h-48 w-full overflow-auto">
                                <h3 class="font-bold">Assigned Employees</h3>
                                <label class="label">
                                    <span class="label-text">Use CTRL/CMD to select multiple</span>
                                </label>
                                <select class="select select-sm select-bordered w-2/4 h-2/4" multiple bind:value={taskToCreate.assignedEmployees}>
                                    {#each employees as employee}
                                        <option value={employee.id}>
                                            {employee.name}
                                        </option>
                                    {/each}
                                </select>
                            </div>
                            <div class="pt-5">
                                <h3 class="font-bold">
                                    Priority
                                </h3>
                                <select bind:value={taskToCreate.level} class="select select-sm select-bordered w-2/3 max-w-sm">
                                    <option disabled selected>Pick a priority</option>
                                    {#each levelSortOrder as level}
                                        <option value={level}>{level}</option>
                                    {/each}
                                </select>
                            </div>
                            <div class="card-actions pt-5 justify-end">
                                <button class="btn btn-ghost btn-sm btn-outline" on:click={() => {createTask()}}>Submit</button>
                            </div>
                        </label>
                    </label>
                </div>
                <div class="pb-2 float-left">
                    <label class="label label-text font-bold" for="filter">
                        Search
                    </label>
                    <input type="search" placeholder="Type a task name" id="filter" bind:value={search} class="input input-sm input-bordered max-w-xs"/>
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
                                    Assignee
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.assignee.localeCompare(b.assignee))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.assignee.localeCompare(b.assignee)).reverse()}
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
                                    Priority
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => levelSortOrder.indexOf(a.level) - levelSortOrder.indexOf(b.level))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => levelSortOrder.indexOf(a.level) - levelSortOrder.indexOf(b.level)).reverse()}
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
                                    Started
                                    <br>
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.startedAt.localeCompare(b.startedAt))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.startedAt.localeCompare(b.startedAt)).reverse()}
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
                                    Completed
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.completedAt.localeCompare(b.completedAt))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.completedAt.localeCompare(b.completedAt)).reverse()}
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
                    {#each paginatedItems as task}
                        <tr>
                            <td class="center">
                                {task.id}</td>
                            <td class="center">
                                {task.name}</td>
                            <td class="center">
                                {task.assignee}</td>
                            {#if task.level === 'MEDIUM'}
                                <td class="center"
                                style="background: yellow">{task.level}</td>
                            {:else if task.level === 'HIGH'}
                                <td class="center"
                                style="background: red">{task.level}</td>
                            {:else}
                                <td class="center"
                                style="background: lawngreen">{task.level}</td>
                            {/if}

                            <td class="center">
                                {task.status}
                            </td>
                            <td class="center">
                                {#if !task.startedAt}
                                    No data
                                {:else }
                                    {formatDateString(task.startedAt)}
                                {/if}
                            </td>
                            <td class="center">
                                {#if !task.completedAt}
                                    No data
                                {:else }
                                    <p>
                                        {formatDateString(task.completedAt)}
                                    </p>
                                {/if}
                            </td>
                            <td>
                                <label for="{task.id+2}" class="btn btn-ghost btn-sm btn-outline">Details</label>
                                <input type="checkbox" id="{task.id+2}" class="modal-toggle" />
                                <label for="{task.id+2}" class="modal cursor-pointer">
                                    <label class="modal-box relative">
                                        <h2 class="text-lg font-bold">Viewing {task.name}</h2>
                                        <div class="pt-5">
                                            <h3 class="font-bold">ID</h3>
                                            <p>{task.id}</p>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Description</h3>
                                            <p>{task.description}</p>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Assigned Employees</h3>
                                            <ul>
                                                {#each task.assignedEmployees as employee}
                                                    <li>{employee.name}</li>
                                                {/each}
                                            </ul>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">
                                                Status
                                            </h3>
                                            <label class="label" style="display: inline-block">
                                                <span class="">{task.status}</span>
                                            </label>
                                            <div class="dropdown" style="display: inline-block">
                                                <button tabindex="0" class="btn m-1 btn-xs btn-outline">
                                                    Update
                                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                         viewBox="0 0 24 24">
                                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                                    </svg>
                                                </button>
                                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                                    {#each statusSortOrder as status}
                                                        {#if task.status !== status}
                                                            <li>
                                                                <button class="btn-sm" on:click={() => {
                                            updateStatus(task, status);
                                            }}>{status}
                                                                </button>
                                                            </li>
                                                        {/if}
                                                    {/each}
                                                </ul>
                                            </div>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">
                                                Priority
                                            </h3>
                                            <label class="label" style="display: inline-block">
                                                <span class="">{task.level}</span>
                                            </label>
                                            <div class="dropdown" style="display: inline-block">
                                                <button tabindex="0" class="btn m-1 btn-xs btn-outline">
                                                    Update
                                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                         viewBox="0 0 24 24">
                                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                                    </svg>
                                                </button>
                                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                                    {#each levelSortOrder as level}
                                                        {#if task.level !== level}
                                                            <li>
                                                                <button class="btn-sm" on:click={() => {
                                            updateLevel(task, level);
                                            }}>{level}
                                                                </button>
                                                            </li>
                                                        {/if}
                                                    {/each}
                                                </ul>
                                            </div>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Started at</h3>
                                            {#if !task.startedAt}
                                                <p>No data</p>
                                            {:else }
                                                <p>
                                                    {formatDateString(task.startedAt)}
                                                </p>
                                            {/if}
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Completed at</h3>
                                            {#if !task.completedAt}
                                                <p>No data</p>
                                            {:else }
                                                <p>
                                                    {formatDateString(task.completedAt)}
                                                </p>
                                            {/if}
                                        </div>
                                        <div class="card-actions pt-5 justify-end">
                                            {#if !task.startedAt}
                                                <button class="btn btn-ghost btn-sm btn-outline" on:click={() => startTask(task)}>Start Task</button>
                                            {/if}
                                            {#if !task.completedAt && task.startedAt}
                                                <button class="btn btn-ghost btn-sm btn-outline" on:click={() => completeTask(task)}>Complete Task</button>
                                            {/if}
                                            <button class="btn btn-ghost btn-sm btn-outline" on:click={() => handleDelete(task)}>Delete Task</button>
                                        </div>
                                    </label>
                                </label>
                                <label for="{task.id+1}" class="btn btn-ghost btn-sm btn-outline">Edit</label>
                                <input type="checkbox" id="{task.id+1}" class="modal-toggle" />
                                <label for="{task.id+1}" class="modal cursor-pointer">
                                    <label class="modal-box relative">
                                        <h2 class="text-lg font-bold">Edit Task {task.id}</h2>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Name</h3>
                                            <input bind:value={taskToUpdate.name} type="text" placeholder="{task.name}" class="input input-sm input-bordered max-w-sm" />
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Description</h3>
                                            <textarea bind:value={taskToUpdate.description} class="textarea textarea-bordered h-48 w-2/3" maxlength="250" placeholder="{task.description}"></textarea>
                                            <label class="label">
                                                <span class="label-text-alt">Characters remaining: {250 - taskToUpdate.description.length}</span>
                                            </label>
                                        </div>
                                        <div class="pt-5 max-h-40 overflow-auto">
                                            <h3 class="font-bold">Assigned Employees</h3>
                                            <label class="label">
                                                <span class="label-text">Use Control(Windows) or CMD (mac) to select multiple</span>
                                            </label>
                                            <select class="select select-bordered w-2/4 h-2/4" multiple bind:value={taskToUpdate.assignedEmployees}>
                                                {#each employees as employee}
                                                    <option value={employee.id}>
                                                        {employee.name}
                                                    </option>
                                                {/each}
                                            </select>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">
                                                Status
                                            </h3>
                                            <select bind:value={taskToUpdate.status} class="select select-sm select-bordered w-2/3 max-w-xs">
                                                <option disabled selected>Pick a status, previous: {task.status}</option>
                                                {#each statusSortOrder as status}
                                                    <option value={status}>{status}</option>
                                                {/each}
                                            </select>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">
                                                Priority
                                            </h3>
                                            <select bind:value={taskToUpdate.level} class="select select-sm select-bordered w-2/3 max-w-sm">
                                                <option disabled selected>Pick a priority, previous: {task.level}</option>
                                                {#each levelSortOrder as level}
                                                    <option value={level}>{level}</option>
                                                {/each}
                                            </select>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Started At</h3>
                                            <input bind:value={taskToUpdate.startedAt} type="datetime-local" placeholder="{formatDateString(task.startedAt)}" class="input input-sm input-bordered max-w-sm" />
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Completed At</h3>
                                            <input bind:value={taskToUpdate.completedAt} type="datetime-local" placeholder="{formatDateString(task.completedAt)}" class="input input-sm input-bordered max-w-sm" />
                                        </div>
                                        <div class="card-actions pt-5 justify-end">
                                            <button class="btn btn-ghost btn-sm btn-outline" on:click={() => {editTask(task)}} type="submit">Submit</button>
                                        </div>
                                    </label>
                                </label>
                                <button class="btn btn-sm btn-outline btn-ghost" on:click={handleDelete(task)}>
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



