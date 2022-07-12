<script context="module">
    export async function load({fetch}) {
        const response = await fetch('http://localhost:3000/api/auth/token/verify', {credentials: "include"});

        if (response.status === 200) {
            return {
                status: 302,
                redirect: "/"
            };
        }

        return {};
    }

</script>

<script>
    import {goto} from "$app/navigation";
    import {getNotificationsContext} from 'svelte-notifications';
    import {handleResponse} from "$lib/handleResponse";
    import {post} from '$lib/authApi';

    const {addNotification} = getNotificationsContext();

    let uname = '';
    let pw = '';

    async function submit() {
        try {
            const response = await post(`/sign-in`, `${uname}:${pw}`);

            uname = null;
            pw = null;

            const handled = handleResponse(response, addNotification);
            if (handled) {

                await goto('/');
            }
        } catch (err) {
            console.log(err);
        }
    }
</script>

<svelte:head>
    <title>Itemizer - Login</title>
</svelte:head>

<div class="hero min-h-screen bg-base-100">
    <div class="hero-content text-center">
        <div class="max-w-md">
            <div class="card rounded-box card-bordered border-gray-300 shadow-xl w-96">
                <div class="pt-5">
                    <h1 class="font-bold text-lg">Itemizer</h1>
                </div>
                <div class="p-5">
                    <form on:submit|preventDefault={submit}>
                        <label class="label justify-start pl-20">
                            <span class="label-text font-bold">Username</span>
                        </label>
                        <input placeholder="Username" bind:value={uname} class="input input-bordered max-w-xs"
                               type="text">
                        <label class="label justify-start pl-20">
                            <span class="label-text font-bold">Password</span>
                        </label>
                        <input placeholder="Password" bind:value={pw} class="input input-bordered max-w-xs"
                               type="password">
                        <br>
                        <br>
                        <button class="btn-success btn" type="submit">Submit</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>