<script context="module">
    export async function load({fetch}) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/admin/token/verify', {credentials: "include"});

            if (response.status !== 200) {
                return {
                    status: 302,
                    redirect: "/"
                };
            }
        } catch (e) {
            return {
                status: 302,
                redirect: "/"
            };
        }

        const res = await fetch('http://localhost:3000/api/auth/users', {credentials: "include"});
        const data = await res.json();
        if (res.status !== 200) {
            console.error(`${data.message}`);
        }
        return {props: {users: data}};
    }
</script>

<script>
    import {onMount} from "svelte";
    import {del, post, patch} from "$lib/api";
    import {getNotificationsContext} from 'svelte-notifications';
    import {handleResponse} from "$lib/handleResponse";
    import {LightPaginationNav, paginate} from "svelte-paginate";
    import {options} from "$lib/toaster";

    const {addNotification} = getNotificationsContext();

    export let users;


    let items = [];

    //Runs after component is rendered to DOM, controls lifecycle of component.
    onMount(async () => {
        items = users;
    });

    //Pagination options
    let currentPage = 1;
    let pageSize = 8;
    $: paginatedItems = paginate({items, pageSize, currentPage});

    //Objects for func
    const employee = {
        name: '',
        email: '',
        phone: '',
        title: '',
        address: {
            street: '',
            city: '',
            zip: '',
            country: ''
        },
    };

    const createEmployee = async () => {
        const response = await post('/resources/employees', employee);

        const handled = handleResponse(response, addNotification);

        if (handled) {
            addNotification(options('Successfully added employee!', 'success'));
            console.log(response.data);
            items = [...items, response.data];
        }
    };

    const handleDelete = async (user) => {
        let index = items.indexOf(user);

        const response = await del(`/auth/users/${user.id}`);

        const handled = handleResponse(response, addNotification);
        if (handled) {
            addNotification(options(response.data.message, 'success'));
            items.splice(index, 1);
            items = items;
        }
    };

    const showByTitle = (title) => {
        const newItems = [];
        users.forEach(user => {
            if (user.employee.title === title) {
                newItems.push(user)
            }
        });
        return items = newItems.sort((a, b) => a.id - b.id);
    };

    const titleSortOrder = ['Worker', 'Supervisor', 'Manager'];
    const roleSortOrder = ['USER', 'MODERATOR', 'ADMIN'];

    // Filtering
    let search = undefined;
    $: paginatedItems = search ?
        items.filter(i => {
            return i.employee.name.match(`${search}.*`)
        }) : paginate({items, pageSize, currentPage});

</script>

<svelte:head>
    <title>Manage</title>
</svelte:head>

<div class="flex mx-auto justify-start pl-20 pt-20">
    <h1 class=" title-font font-bold text-2xl">Employees & Users</h1>
</div>

<section class="pt-5">
    <div class="container mx-auto flex flex-wrap p-8 rounded-box w-full">
        <label class="label">
            <span class="label-text font-bold">Show by: </span>
        </label>
        <div class="dropdown">
            <label tabindex="0" class="btn m-1 btn-sm btn-outline">
                Title
                <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                </svg>
            </label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                <li>
                    <button class="btn-sm" on:click={() => {
                            items = users;
                        }}>ALL
                    </button>
                </li>
                {#each titleSortOrder as title}
                    <li>
                        <button class="btn-sm" on:click={() => {
                            showByTitle(title);
                        }}>{title}
                        </button>
                    </li>
                {/each}
            </ul>
        </div>

        <div class="grid w-full">
                <div class="flow-root">
                    <div class="pb-2 justify-end float-right">
                        <label for="addItem" class="btn btn-ghost btn-md btn-outline">Add Employee</label>
                        <input type="checkbox" id="addItem" class="modal-toggle" />
                        <label for="addItem" class="modal cursor-pointer">
                            <label class="modal-box relative">
                                <h2 class="text-lg font-bold">Add Employee</h2>
                                <div class="grid grid-cols-2 pt-5 gap-3 w-full">
                                    <div>
                                        <h2 class="text-lg font-bold">Personal info</h2>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Name</h3>
                                            <input bind:value={employee.name} type="text" placeholder="Name" class="input input-sm input-bordered max-w-sm" />
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Email</h3>
                                            <input bind:value={employee.email} type="text" placeholder="test@example.dk" class="input input-sm input-bordered max-w-sm" />
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Phone Number</h3>
                                            <input bind:value={employee.phone} type="text" placeholder="10203040" class="input input-sm input-bordered max-w-sm" />
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">
                                                Title
                                            </h3>
                                            <select bind:value={employee.title} class="select select-sm select-bordered max-w-xs">
                                                <option disabled selected>Pick a title</option>
                                                {#each titleSortOrder as title}
                                                    <option value={title}>{title}</option>
                                                {/each}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 class="text-lg font-bold">Address</h2>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Country</h3>
                                            <input bind:value={employee.address.country} type="text" placeholder="Denmark" class="input input-sm input-bordered max-w-sm" />
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Street</h3>
                                            <input bind:value={employee.address.street} type="text" placeholder="123 Street" class="input input-sm input-bordered max-w-sm" />
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">City</h3>
                                            <input bind:value={employee.address.city} type="text" placeholder="Frederiksberg" class="input input-sm input-bordered max-w-sm" />
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Zip Code</h3>
                                            <input bind:value={employee.address.zip} type="text" placeholder="2000" class="input input-sm input-bordered max-w-sm" />
                                        </div>

                                    </div>
                                </div>
                                <div class="card-actions pt-5 justify-end">
                                    <button class="btn btn-ghost btn-sm btn-outline" on:click={() => {createEmployee()}}>Submit</button>
                                </div>
                            </label>
                        </label>
                    </div>
                    <div class="pb-2 float-left">
                        <label class="label label-text font-bold" for="filter">
                            Search
                        </label>
                        <input type="search" placeholder="Type employee name" id="filter" bind:value={search} class="input input-sm input-bordered max-w-sm"/>
                    </div>
                </div>
            <div class="overflow-x-auto">
                <table class="table table-zebra">
                    <thead>
                    <tr>
                        <th>
                            <div class="dropdown">
                                <label tabindex="0" class="btn m-1 btn-xs btn-ghost">
                                    User ID
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
                                    Emp. ID
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.employee_id - b.employee_id)}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.employee_id - b.employee_id).reverse()}
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
                                    Username
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.username.localeCompare(b.username))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.username.localeCompare(b.username)).reverse()}
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
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.employee.name.localeCompare(b.employee.name))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.employee.name.localeCompare(b.employee.name)).reverse()}
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
                                    Title
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.employee.title.localeCompare(b.employee.title))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.employee.title.localeCompare(b.employee.title)).reverse()}
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
                                    Email
                                    <br>
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.email.localeCompare(b.email))}
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => a.email.localeCompare(b.email)).reverse()}
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
                                    Role
                                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                         viewBox="0 0 24 24">
                                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                                    </svg>
                                </label>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => {
                                            a.roles.forEach(i => {
                                                b.roles.forEach(x => {
                                                    return roleSortOrder.indexOf(i.role) - roleSortOrder.indexOf(x.role)
                                                });
                                            });
                                            })
                                        }
                                        >ASCENDING
                                        </button>
                                    </li>
                                    <li>
                                        <button class="btn-sm" on:click={() => items = items.sort((a, b) => {
                                            a.roles.forEach(i => {
                                                b.roles.forEach(x => {
                                                    return roleSortOrder.indexOf(i.role) - roleSortOrder.indexOf(x.role)
                                                });
                                            });
                                            }).reverse()
                                        }>DESCENDING
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
                    {#each paginatedItems as user}
                        <tr>
                            <td class="center">
                                {user.id}</td>
                            <td class="center">
                                {user.employee_id}</td>
                            <td class="center">
                                {user.username}</td>
                            <td class="center">
                                {user.employee.name}</td>
                            <td class="center">
                                {user.employee.title}
                            </td>
                            <td class="center">
                                {user.email}
                            </td>
                            <td class="center">
                                {user.roles[user.roles.length - 1].role}
                            </td>
                            <td>
                                <label for="{user.id+2}" class="btn btn-ghost btn-sm btn-outline">Details</label>
                                <input type="checkbox" id="{user.id+2}" class="modal-toggle" />
                                <label for="{user.id+2}" class="modal cursor-pointer">
                                    <label class="modal-box relative">
                                        <h2 class="text-lg font-bold">Viewing {user.employee.name}</h2>
                                        <div class="grid grid-cols-3 pt-5 gap-1 w-full">
                                            <div>
                                                <h2 class="font-bold text-lg">Personal Info</h2>
                                                    <div class="pt-5">
                                                        <h3 class="font-bold">ID</h3>
                                                        <p>{user.employee.id}</p>
                                                    </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Name</h3>
                                                    <p>{user.employee.name}</p>
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Email</h3>
                                                    <p>{user.employee.email}</p>
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Phone</h3>
                                                    <p>{user.employee.phone}</p>
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Title</h3>
                                                    <p>{user.employee.title}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h2 class="font-bold text-lg">Address</h2>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Street</h3>
                                                    <p>{user.employee.address.street}</p>
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">City</h3>
                                                    <p>{user.employee.address.city}</p>
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Zip Code</h3>
                                                    <p>{user.employee.address.zip}</p>
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Country</h3>
                                                    <p>{user.employee.address.country}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <h2 class="font-bold text-lg">User Info</h2>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">ID</h3>
                                                    <p>{user.id}</p>
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Username</h3>
                                                    <p>{user.username}</p>
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Email</h3>
                                                    <p>{user.email}</p>
                                                </div>
                                                <div class="pt-5">
                                                    <h3 class="font-bold">Roles</h3>
                                                    <ul>
                                                        {#each user.roles as role}
                                                            <li>{role.role}</li>
                                                            {/each}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="card-actions pt-5 justify-end">
                                            <button class="btn btn-ghost btn-sm btn-outline" on:click={() => handleDelete(user)}>Delete</button>
                                        </div>
                                    </label>
                                </label>
                                <button class="btn btn-sm btn-outline btn-ghost" on:click={handleDelete(user)}>
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


