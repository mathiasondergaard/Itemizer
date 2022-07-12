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

        const res = await fetch(`http://localhost:3000/api/resources/employees/token/details`, {credentials: "include"});
        const data = await res.json();
        if (res.status !== 200) {
            console.error(`${data.message}`);
        }
        return {props: {details: data}};
    }
</script>

<script>
    import {patch, put} from "$lib/authApi";
    import {getNotificationsContext} from 'svelte-notifications';
    import {handleResponse} from "$lib/handleResponse";
    import EmployeeInfoBlock from "../../components/EmployeeInfoBlock.svelte";
    import UserInfoBlock from "../../components/UserInfoBlock.svelte";
    import {options} from "$lib/toaster";
    import {goto} from "$app/navigation";

    const {addNotification} = getNotificationsContext();

    export let details;

    let pw;
    let oldPw;
    let confirmPw;

    const changePw = async () => {
        if (pw !== confirmPw) {
            addNotification(options('Passwords do not match!', 'warning'));
            return;
        }

        if (pw.length < 9) {
            addNotification(options('Password must be 10 characters or more!', 'warning'));
            return;
        }

        const response = await patch(`/users/${details.user.id}/password`, `${pw}:${oldPw}`);

        const handled = handleResponse(response, addNotification);
        pw = null;
        oldPw = null;
        confirmPw = null;

        if (handled) {
            addNotification(options('Successfully updated your password!', 'success'));
        }
    };

    const edit = async () => {
        employeeToUpdate.employee.email = employeeToUpdate.user.email;
        const response = await put('/resources/employees/employee/own-details', employeeToUpdate);
        const handled = handleResponse(response, addNotification);

        if (handled) {
            addNotification(options('Successfully updated your details!. Redirecting to profile!', 'success'));
            await new Promise(r => setTimeout(r, 3000));

            await goto('/profile');
        }
    };

    const employeeToUpdate = {
        employee: {
            name: '',
            email: '',
            phone: '',
            address: {
                street: '',
                city: '',
                zip: '',
                country: ''
            }
        },
        user: {
            username: '',
            email: '',
        }
    };

</script>

<svelte:head>
    <title>{'Profile - ' + details.employee.name}</title>
</svelte:head>

<div class="flex mx-auto justify-start pl-20 pt-20">
    <h1 class=" title-font font-bold text-2xl">
        Hi {details.employee.name}!</h1>
</div>

<section class="pt-5">
    <div class="container mx-auto flex flex-wrap p-8 rounded-box w-full">
        <div class="card lg:card-side bg-base-100 shadow-xl">

            <div class="card-body">
                <div class="card-actions justify-end pt-5">
                    <button on:click={() => history.back()} class="btn btn-outline justify-end btn-ghost btn-sm">
                        Return
                    </button>
                </div>
                <h2 class="card-title font-bold text-xl">Your profile</h2>
                <br/>
                <div class="grid grid-cols-3 gap-1 w-full">
                    <div>
                        <EmployeeInfoBlock employee={details.employee} address={details.address} />
                    </div>
                    <div>
                        <UserInfoBlock user={details.user} />
                    </div>
                    <div>
                            <h3 class="font-bold text-lg">Change password</h3>
                        <div class="pt-5">
                            <form on:submit|preventDefault={changePw}>
                                <div class="pt-2">
                                <input placeholder="Old password" bind:value={oldPw} class="input input-sm input-bordered max-w-sm"
                                       type="password"/>
                            </div>
                            <div class="pt-2">
                                <input placeholder="New PW (10 chars)" bind:value={pw} class="input input-sm input-bordered max-w-sm"
                                       type="password">
                                <label class="label">
                                    <span class="label-text-alt">Must be at least 10 chars.</span>
                                </label>
                            </div>
                            <div class="pt-2">
                                <input placeholder="Confirm new password" bind:value={confirmPw} class="input input-sm input-bordered max-w-sm"
                                       type="password">
                            </div>
                            <div class="pt-5">
                                <button type="submit" class="btn-success btn btn-sm btn-ghost btn-outline">Submit</button>
                            </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="card-actions pt-5 justify-end">
                    <label for="{details.employee.id}" class="btn btn-ghost btn-sm btn-outline">Edit</label>
                    <input type="checkbox" id="{details.employee.id}" class="modal-toggle" />
                    <label for="{details.employee.id}" class="modal cursor-pointer">
                        <label class="modal-box relative">
                            <h2 class="card-title font-bold text-xl">Edit details</h2>
                            <br/>
                            <form on:submit|preventDefault={edit}>
                                <div class="grid grid-cols-2 gap-3 w-full">
                                    <div>
                                        <h2 class="font-bold text-lg">Personal info</h2>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Name</h3>
                                            <input bind:value={employeeToUpdate.employee.name} type="text"
                                                   placeholder="{details.employee.name}"
                                                   class="input input-sm input-bordered max-w-sm"/>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">
                                                Phone
                                            </h3>
                                            <input bind:value={employeeToUpdate.employee.phone} type="text"
                                                   placeholder="{details.employee.phone}"
                                                   class="input input-sm input-bordered max-w-sm"/>
                                        </div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Street</h3>
                                            <input bind:value={employeeToUpdate.employee.address.street} type="text"
                                                   placeholder="{details.address.street}"
                                                   class="input input-sm input-bordered max-w-sm"/>
                                            <h3 class="font-bold">City</h3>
                                            <input bind:value={employeeToUpdate.employee.address.zip} type="text"
                                                   placeholder="{details.address.zip}"
                                                   class="input input-sm input-bordered max-w-sm"/>
                                            <h3 class="font-bold">Zip Code</h3>
                                            <input bind:value={employeeToUpdate.employee.address.city} type="text"
                                                   placeholder="{details.address.city}"
                                                   class="input input-sm input-bordered max-w-sm"/>
                                            <h3 class="font-bold">Country</h3>
                                            <input bind:value={employeeToUpdate.employee.address.country} type="text"
                                                   placeholder="{details.address.country}"
                                                   class="input input-sm input-bordered max-w-sm"/>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 class="text-lg font-bold">User info</h2>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Username</h3>
                                            <input bind:value={employeeToUpdate.user.username} type="text"
                                                   placeholder="{details.user.username}"
                                                   class="input input-sm input-bordered w-2/3 max-w-xs"/></div>
                                        <div class="pt-5">
                                            <h3 class="font-bold">Email</h3>
                                            <input bind:value={employeeToUpdate.user.email} type="text"
                                                   placeholder="{details.user.email}"
                                                   class="input input-sm input-bordered w-2/3 max-w-xs"/></div>
                                    </div>
                                </div>
                                <div class="card-actions pt-5 justify-end">
                                    <div class="card-actions pt-5 justify-end">
                                        <button class="btn btn-ghost btn-sm btn-outline" type="submit">Submit</button>
                                    </div>
                                </div>
                            </form>
                        </label>
                    </label>
                </div>
            </div>
        </div>
    </div>
</section>

