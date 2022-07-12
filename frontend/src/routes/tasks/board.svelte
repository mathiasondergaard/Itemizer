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
        return {props: {tasks: data}};
    }
</script>

<script>
    import {formatDateString} from "$lib/formatDate";
    export let tasks;

    const tasksNotStarted = tasks.filter(i => i.status === 'NOT-STARTED');
    const tasksOnGoing = tasks.filter(i => i.status === 'ON-GOING');
    const tasksPostponed = tasks.filter(i => i.status === 'POSTPONED');
    const tasksCompleted = tasks.filter(i => i.status === 'COMPLETED');

</script>

<svelte:head>
    <title>Tasks - Board</title>
</svelte:head>

<div class="flex mx-auto justify-start pl-20 pt-20">
    <h1 class=" title-font font-bold text-2xl">Task Board</h1>
</div>

<section class="pt-5">
    <div class="container mx-auto p-8 flex flex-wrap rounded-box w-full">
        <div class="grid grid-cols-4 gap-6 w-full">
            <div class="">
                <h2 class="pb-5 pt-5 text-lg title-font font-bold">NOT-STARTED</h2>
                <div class="overflow-scroll rounded-box h-3/4 border shadow-xl">
                    {#if tasksNotStarted.length === 0}
                        <h2 class="pb-5 pt-5 text-lg title-font font-bold">No data</h2>
                    {:else }
                        {#each tasksNotStarted as task}
                            <div class="card bg-base-100 p-2">
                                <div tabindex="0" id="{task.id}" on:click={() => {document.getElementById(task.id).scrollIntoView();
}} class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                    <div class="collapse-title text-lg font-medium">
                                        {task.name}
                                    </div>
                                    <div class="collapse-content">
                                        <div class="w-2/3">
                                            <h3 class="font-bold">ID</h3>
                                            <p>{task.id}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Description</h3>
                                            <p>{task.description}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Assigned Employees</h3>
                                            <ul>
                                                {#each task.assignedEmployees as employee}
                                                    <li>{employee.name}</li>
                                                {/each}
                                            </ul>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">
                                                Status
                                            </h3>
                                            <p>{task.status}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">
                                                Priority
                                            </h3>
                                            <p>{task.level}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Started at</h3>
                                            {#if !task.startedAt}
                                                <p>No data</p>
                                            {:else }
                                                <p>
                                                    {formatDateString(task.startedAt)}
                                                </p>
                                            {/if}
                                        </div>
                                        <div class="w-2/3">
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
                                            <a class="btn btn-ghost btn-sm btn-outline" rel="external" sveltekit:prefetch="" href="/tasks/{task.id}">Details</a>
                                            <a class="btn btn-ghost btn-sm btn-outline" rel="external" sveltekit:prefetch="" href="/tasks/{task.id}/edit">Edit Task</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
            <div class="">
                <h2 class="pb-5 pt-5 text-lg title-font font-bold">ON-GOING</h2>
                <div class="overflow-auto rounded-box h-3/4 border shadow-xl">
                    {#if tasksOnGoing.length === 0}
                        <h2 class="pb-5 pt-5 text-lg title-font font-bold">No data</h2>
                    {:else }
                        {#each tasksOnGoing as task}
                            <div class="card bg-base-100 p-2">
                                <div tabindex="0" id="{task.id}" on:click={() => {document.getElementById(task.id).scrollIntoView();
}} class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                    <div class="collapse-title text-lg font-medium">
                                        {task.name}
                                    </div>
                                    <div class="collapse-content">
                                        <div class="w-2/3">
                                            <h3 class="font-bold">ID</h3>
                                            <p>{task.id}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Description</h3>
                                            <p>{task.description}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Assigned Employees</h3>
                                            <ul>
                                                {#each task.assignedEmployees as employee}
                                                    <li>{employee.name}</li>
                                                {/each}
                                            </ul>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">
                                                Status
                                            </h3>
                                            <p>{task.status}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">
                                                Priority
                                            </h3>
                                            <p>{task.level}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Started at</h3>
                                            {#if !task.startedAt}
                                                <p>No data</p>
                                            {:else }
                                                <p>
                                                    {formatDateString(task.startedAt)}
                                                </p>
                                            {/if}
                                        </div>
                                        <div class="w-2/3">
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
                                            <a class="btn btn-ghost btn-sm btn-outline" rel="external" sveltekit:prefetch="" href="/tasks/{task.id}">Details</a>
                                            <a class="btn btn-ghost btn-sm btn-outline" rel="external" sveltekit:prefetch="" href="/tasks/{task.id}/edit">Edit Task</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                     {/if}
                </div>
            </div>
            <div class="">
                <h2 class="pb-5 pt-5 text-lg title-font font-bold">COMPLETED</h2>
                <div class="overflow-auto rounded-box h-3/4 border shadow-xl">
                    {#if tasksCompleted.length === 0}
                        <h2 class="pb-5 pt-5 text-lg title-font font-bold">No data</h2>
                    {:else }
                        {#each tasksCompleted as task}
                            <div class="card bg-base-100 p-2">
                                <div tabindex="0" id="{task.id}" on:click={() => {document.getElementById(task.id).scrollIntoView();
}} class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                    <div class="collapse-title text-lg font-medium">
                                        {task.name}
                                    </div>
                                    <div class="collapse-content">
                                        <div class="w-2/3">
                                            <h3 class="font-bold">ID</h3>
                                            <p>{task.id}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Description</h3>
                                            <p>{task.description}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Assigned Employees</h3>
                                            <ul>
                                                {#each task.assignedEmployees as employee}
                                                    <li>{employee.name}</li>
                                                {/each}
                                            </ul>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">
                                                Status
                                            </h3>
                                            <p>{task.status}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">
                                                Priority
                                            </h3>
                                            <p>{task.level}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Started at</h3>
                                            {#if !task.startedAt}
                                                <p>No data</p>
                                            {:else }
                                                <p>
                                                    {formatDateString(task.startedAt)}
                                                </p>
                                            {/if}
                                        </div>
                                        <div class="w-2/3">
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
                                            <a class="btn btn-ghost btn-sm btn-outline" rel="external" sveltekit:prefetch="" href="/tasks/{task.id}">Details</a>
                                            <a class="btn btn-ghost btn-sm btn-outline" rel="external" sveltekit:prefetch="" href="/tasks/{task.id}/edit">Edit Task</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
            <div class="">
                <h2 class="pb-5 pt-5 text-lg title-font font-bold">POSTPONED</h2>
                <div class="overflow-auto rounded-box h-3/4 border shadow-xl">
                    {#if tasksPostponed.length === 0}
                        <h2 class="pb-5 pt-5 text-lg title-font font-bold">No data</h2>
                    {:else }
                        {#each tasksPostponed as task}
                            <div class="card bg-base-100 p-2">
                                <div tabindex="0" id="{task.id}" on:click={() => {document.getElementById(task.id).scrollIntoView();
}} class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                                    <div class="collapse-title text-lg font-medium">
                                        {task.name}
                                    </div>
                                    <div class="collapse-content">
                                        <div class="w-2/3">
                                            <h3 class="font-bold">ID</h3>
                                            <p>{task.id}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Description</h3>
                                            <p>{task.description}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Assigned Employees</h3>
                                            <ul>
                                                {#each task.assignedEmployees as employee}
                                                    <li>{employee.name}</li>
                                                {/each}
                                            </ul>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">
                                                Status
                                            </h3>
                                            <p>{task.status}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">
                                                Priority
                                            </h3>
                                            <p>{task.level}</p>
                                        </div>
                                        <div class="w-2/3">
                                            <h3 class="font-bold">Started at</h3>
                                            {#if !task.startedAt}
                                                <p>No data</p>
                                            {:else }
                                                <p>
                                                    {formatDateString(task.startedAt)}
                                                </p>
                                            {/if}
                                        </div>
                                        <div class="w-2/3">
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
                                            <a class="btn btn-ghost btn-sm btn-outline" rel="external" sveltekit:prefetch="" href="/tasks/{task.id}">Details</a>
                                            <a class="btn btn-ghost btn-sm btn-outline" rel="external" sveltekit:prefetch="" href="/tasks/{task.id}/edit">Edit Task</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    h2 {
        text-align: center;
    }
</style>