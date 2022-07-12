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

        const logRes = await fetch('http://localhost:3000/api/resources/inventory/logs', {credentials: "include"});
        const blRes = await fetch('http://localhost:3000/api/resources/inventory/batch-logs', {credentials: "include"});

        if (logRes.status !== 200 || blRes.status !== 200) {
            console.error(`${logRes.message}`);
            console.error(`${blRes.message}`);
        }

        return {props: {logs: await logRes.json(), batchLogs: await blRes.json()}};
    }
</script>

<script>
    import {getNotificationsContext} from 'svelte-notifications';
    import LogsTable from "../../../components/LogsTable.svelte";
    import BatchLogsTable from "../../../components/BatchLogsTable.svelte";

    const {addNotification} = getNotificationsContext();

    export let logs;
    export let batchLogs;

</script>

<svelte:head>
    <title>Inventory - Logs</title>
</svelte:head>

<div class="flex mx-auto justify-start pl-20 pt-20">
    <h1 class=" title-font font-bold text-2xl">Inventory Logs</h1>
</div>

<section class="pt-5">
    <div class="container mx-auto flex flex-wrap p-8 rounded-box w-full">
        <div class="grid w-full">
            <div class="py-5">
                <div class="pb-3">
                    <h2 class="font-bold text-lg">Single Updates</h2>
                </div>
                <LogsTable logs={logs} addNotification={addNotification}/>
            </div>
            <div class="pt-5">
                <div class="pb-3">
                    <h2 class="font-bold text-lg">Batch Updates</h2>
                </div>
                <BatchLogsTable batchLogs={batchLogs} addNotification={addNotification}/>
            </div>
        </div>
    </div>
</section>



