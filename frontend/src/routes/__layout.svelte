<script>
    import Fa from 'svelte-fa/src/fa.svelte'
    import Notifications from "svelte-notifications";
    import {post} from "$lib/api";
    import { faTasks, faWarehouse, faGear, faUser, faArrowRightFromBracket, faLock, faChalkboard, faPaperPlane, faDownload} from '@fortawesome/free-solid-svg-icons/index.es'
    import '../app.css';
    import {goto} from "$app/navigation";
    import {download} from "$lib/fileDownload";

    const logout = async () => {
        await post('/auth/log-out');
        await goto('/login');
    };

    const collectLogs = async () => {
        const response = await fetch('http://localhost:3000/api/utility/logs/collect', {credentials: 'include'});
        const blob = await response.blob();
        return download(blob, 'full_logs.zip');
    };

</script>

<div class="navbar">
    <div class="navbar-start">
        <a href="/" sveltekit:prefetch="" class="btn btn-ghost normal-case text-2xl">Itemizer</a>
    </div>
    <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal p-0">
            <li tabindex="0">
                <a rel="external" class="btn-ghost" sveltekit:prefetch="" href="/tasks">
                    <Fa icon={faTasks} />
                    Tasks
                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                         viewBox="0 0 24 24">
                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                    </svg>
                </a>
                <ul class="p-2">
                    <li>
                        <a rel="external" class="btn-ghost" href="/tasks/board"><Fa icon={faChalkboard} />Board</a>
                    </li>
                </ul>
            </li>
            <li tabindex="0">
                <a rel="external" class="btn-ghost" href="/inventory">
                    <Fa icon={faWarehouse} />
                    Inventory
                    <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                         viewBox="0 0 24 24">
                        <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                    </svg>
                </a>
                <ul class="p-2">
                    <li><a rel="external" class="btn-ghost" href="/inventory/logs"><Fa icon={faPaperPlane} />Logs</a></li>
                </ul>
            </li>

            <li tabindex="0">
                <a rel="external" class="btn-ghost" href="/manage">
                    <Fa icon={faLock} />
                    Manage
                </a>
            </li>
        </ul>
    </div>
    <div class="navbar-end">
        <div class="dropdown">
            <label tabindex="0" class="btn m-1 btn-sm btn-ghost">
                <Fa icon={faGear} size="lg"/>
                <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"/>
                </svg>
            </label>
            <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
                <li>
                    <button on:click={() => collectLogs()} class="btn-sm btn-ghost">
                    Collect Logs
                    </button>
                </li>
            </ul>
        </div>
            <a href="/profile" rel="external" class="btn btn-ghost btn-sm"><Fa icon={faUser} size="lg"/></a>
            <button class="btn btn-ghost btn-sm" on:click={logout}><Fa icon={faArrowRightFromBracket} size="lg"/></button>
    </div>
</div>

<Notifications>
    <slot/>
</Notifications>


