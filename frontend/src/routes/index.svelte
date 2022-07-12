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

        const res = await fetch('http://localhost:3000/api/resources/tasks/employee/internal', {credentials: "include"});
        const data = await res.json();
        if (res.status !== 200) {
            console.error(`${data.message}`);
        }
        return {props: {tasks: data}};
    }
</script>

<script>
    import {onMount} from "svelte";
    import {getNotificationsContext} from 'svelte-notifications';
    import {LightPaginationNav, paginate} from "svelte-paginate";
    import {handleResponse} from "$lib/handleResponse";
    import {patch} from "$lib/api";
    import {options} from "$lib/toaster";
    import {formatDateString} from "$lib/formatDate";

    export let tasks;
    const {addNotification} = getNotificationsContext();

    let items = [];

    //Runs after component is rendered to DOM, controls lifecycle of component.
    onMount(async () => {
        items = tasks;
    });

    //Pagination options
    let currentPage = 1;
    let pageSize = 8;
    $: paginatedItems = paginate({items, pageSize, currentPage});

    const startTask = async (task) => {
        let index = items.indexOf(task);

        const response = await patch(`/resources/tasks/${task.id}/start`);

        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
            items[index].startedAt = response.data.date;
            items[index].status = response.data.status;
            items[index].startedAt = items[index].startedAt;
            items[index].status = items[index].status;
        }
    };

    const completeTask = async (task) => {
        let index = items.indexOf(task);

        const response = await patch(`/resources/tasks/${task.id}/complete`);

        const handled = handleResponse(response, addNotification);

        if (handled) {
            addNotification(options(response.data.message, 'success'));
            items[index].completedAt = response.data.date;
            items[index].status = response.data.status;
            items[index].completedAt = items[index].completedAt;
            items[index].status = items[index].status;
        }
    };

    const levelSortOrder = ['LOW', 'MEDIUM', 'HIGH'];
    const statusSortOrder = ['NOT-STARTED', 'ON-GOING', 'COMPLETED', 'POSTPONED'];

    // Filtering
    let search = undefined;
    $: paginatedItems = search ?
        items.filter(i => {
            return i.name.match(`${search}.*`)
        }) : paginate({items, pageSize, currentPage});
</script>

<svelte:head>
    <title>Your Dashboard</title>
</svelte:head>

<div class="flex mx-auto justify-start pl-20 pt-20">
    <h1 class=" title-font font-bold text-2xl">Tasks assigned to you</h1>
</div>

<section class="pt-5">
    <div class="container mx-auto flex flex-wrap p-8 rounded-box w-full">

        <div class="overflow-x-auto pt-10">
            <div class="pb-2">
                <label class="label label-text font-bold" for="filter">
                    Search
                </label>
                <input type="search" id="filter" bind:value={search} class="input input-sm input-bordered max-w-xs"
                       placeholder="Type a Task name"/>
            </div>
            <table class="table table-zebra">
                <!-- head -->
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
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => a.id - b.id).reverse() }>
                                        DESCENDING
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </th>
                    <th class="justify-items-center">
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
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => a.name.localeCompare(b.name))}
                                    >ASCENDING
                                    </button>
                                </li>
                                <li>
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => a.name.localeCompare(b.name)).reverse()}
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
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => a.assignee.localeCompare(b.assignee))}
                                    >ASCENDING
                                    </button>
                                </li>
                                <li>
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => a.assignee.localeCompare(b.assignee)).reverse()}
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
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => levelSortOrder.indexOf(a.level) - levelSortOrder.indexOf(b.level))}
                                    >ASCENDING
                                    </button>
                                </li>
                                <li>
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => levelSortOrder.indexOf(a.level) - levelSortOrder.indexOf(b.level)).reverse()}
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
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => statusSortOrder.indexOf(a.status) - statusSortOrder.indexOf(b.status))}
                                    >ASCENDING
                                    </button>
                                </li>
                                <li>
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => statusSortOrder.indexOf(a.status) - statusSortOrder.indexOf(b.status)).reverse()}
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
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => a.startedAt.localeCompare(b.startedAt))}
                                    >ASCENDING
                                    </button>
                                </li>
                                <li>
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => a.startedAt.localeCompare(b.startedAt)).reverse()}
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
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => a.completedAt.localeCompare(b.completedAt))}
                                    >ASCENDING
                                    </button>
                                </li>
                                <li>
                                    <button class="btn-sm"
                                            on:click={() => items = items.sort((a, b) => a.completedAt.localeCompare(b.completedAt)).reverse()}
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
                            <td class="center" style="background: red">{task.level}</td>
                        {:else}
                            <td class="center" style="background: lawngreen">{task.level}</td>
                        {/if}

                        <td class="center">
                            {task.status}
                        </td>
                        <td class="center">
                            {#if !task.startedAt}
                                <button on:click={() => startTask(task)} class="btn btn-ghost btn-sm btn-outline">Start
                                    Task
                                </button>
                            {:else }
                                {formatDateString(task.startedAt)}
                            {/if}
                        </td>
                        <td class="center">
                            {#if !task.completedAt && task.startedAt}
                                <button on:click={() => completeTask(task)} class="btn btn-ghost btn-sm btn-outline">
                                    Complete Task
                                </button>
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
                                        <h3 class="font-bold">Status</h3>
                                        <p>{task.status}</p>
                                    </div>
                                    <div class="pt-5">
                                        <h3 class="font-bold">Priority</h3>
                                        <p>{task.level}</p>
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
                                    </div>
                                </label>
                            </label>
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
</section>


