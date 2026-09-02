<script lang="ts">

    import { disconnectWallet, isMe, me, solToLamports, transacting, transactionState, walletConnected,walletConnecting,  walletInitial, walletState } from "kit-squared";
    import { requestAndConnectWallet } from "$lib/components/walletSelectionComponent";
    import { data, values } from "$lib/data/data";
    import { acquire, acquireAndAppend, append, clear, clearAndAppend, initialising, reInitialise } from "$lib";
    import { rpcError, rpcHasError } from "$lib/rpcError";



    function buildNestedObject(label: string, obj: any | {[key: string]: any}){
        let level = 0;
        let output: {
            level: number,
            row: string
        }[] = [];

        function _nest(label: string, prop: any | {[key: string]: any}){
            if(typeof prop === "object" && !Array.isArray(prop)){
                output.push({
                    level: level,
                    row: `${label} : {`,
                }) 
                level++;
                for(let i in prop){
                    _nest(i,prop[i]);
                }
                level--;
                output.push({
                    level: level,
                    row: `}`,
                }) 
            }else{

                // let _prop;
                // if(Array.isArray(prop)){
                //     _prop = `[${prop.join(",")}]`
                // }else{
                //     _prop = prop;
                // }

                output.push({
                    level: level,
                    row: `${label} : ${prop}`
                }) 
            }
        }
        _nest(label, obj);
        function _pad(str: string,level: number){
            let p = "";
            for(let i = 0; i < level; i++){
                p += "&nbsp;&nbsp;&nbsp;"
            }
            p += str;
            return p;
        }

        let domString = "<div>";

        for(let i in output){
            domString += `<div>${_pad(output[i].row, output[i].level)}</div>`;
        }

        domString += "</div>";

        return domString;

    }

    


    let valueInput = $state("");
    let messageInput = $state("");


    let httpRPCInput = $state("");
    let wsRPCInput = $state("");

    async function acquireClick(){
        const value = solToLamports(valueInput);
        await acquire(value);
    }
    async function acquireAndAppendClick(){
        const value = solToLamports(valueInput);
        await acquireAndAppend(value,messageInput);
    }
    async function appendClick(){
        await append(messageInput);
    }
    async function clearAndAppendClick(){
        await clearAndAppend(messageInput);
    }
    async function clearClick(){
        await clear();
    }

    async function setRpcClick(){
        reInitialise(httpRPCInput,wsRPCInput);
    }

    

</script>


<style>
    * {
        display: initial;
    }

    .debug{
        background: white;
        display: flex;
        flex-direction: column;
        overflow-y: scroll;
        width: 100%;
        padding: 0 10px;
    }
    .debug2{
                display: flex;
        flex-direction: column;
    }
    .buttonGroup{
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    }
    .boldProperty{
        font-weight: bold;
        background-color: pink;
    }

    button{
        outline: black solid 1px;
        background: lightblue;
    }

    * {
        font-family: sans-serif;
    }

</style>

<!-- https://shared.eu-central-1.getblock.io/9e5457ea4bee4b1699543049d1cb4051 -->
<!-- https://shared.eu-central-1.getblock.io/55d5e3005b35412099bf5950ea00df5e -->


<div class="debug">

    {#if $rpcHasError}
        <div>RPC ERROR:</div>
        <div>{$rpcError}</div>
        <div>Consider switching RPC</div>
    {/if}



{#if !$initialising}
    <div>HTTP:</div>
    <input type="text" bind:value={httpRPCInput}>
    <div>WS:</div>
    <input type="text" bind:value={wsRPCInput}>
    <button onclick={setRpcClick}>CHANGE RPC</button>
{:else}
    <div>Initialising...</div>
{/if}

    <br/>


    <div>
        {#if $walletInitial}
            <button onclick={requestAndConnectWallet}>Connect</button>
        {:else if $walletConnected}
            <button onclick={disconnectWallet}>Disconnect</button>
        {:else}
            ...
        {/if}
    </div>
    <br/>
    <div>Transacting: {$transacting}</div>
    <div>Transaction State: {$transactionState}</div>

    <br/>

    {#if $walletConnected}

    <div>me: {$me}</div>


    <div class="buttonGroup">
        <div>Value (SOL)</div>
        <div><input bind:value={valueInput}/></div>
    </div>

    
    <div class="buttonGroup">
        <div>Message</div>
        <div><input bind:value={messageInput}/></div>
    </div>




    {#if !isMe($values.poster)}
        <div class="buttonGroup">
            <button onclick={acquireClick}>Acquire</button>
        </div>

        <div class="buttonGroup">
            <button onclick={acquireAndAppendClick}>Acquire and Append</button>
        </div>
    {:else}

        <div class="buttonGroup">
            <button onclick={appendClick}>Append</button>
        </div>

        <div class="buttonGroup">
            <button onclick={clearClick}>Clear</button>
        </div>

        <div class="buttonGroup">
            <button onclick={clearAndAppendClick}>Clear and Append</button>
        </div>
    {/if}


    {/if}

    <br/>
    <br/>
    <br/>


    <div class="boldProperty">== DATA == </div>

    <div class="debug2">


    {#each Object.keys($data) as key }
        <div>{key}:
            {#if $data[key].loaded}
                {#if key === "levels"}
                    {$data[key].value}
                {:else if typeof $data[key].value !== 'object'}
                    {$data[key].value}
                {:else}

                    {@html buildNestedObject("---",$data[key].value)}
                    <!-- {"{"}
                    {#each Object.keys($data[key].value) as k2}
                        <div>{@html "&nbsp;&nbsp;&nbsp;" }  {k2}: {$data[key].value[k2]}</div>
                    {/each}
                    {"}"} -->
                {/if}
            {:else}
                [{$data[key].state}]
            {/if}
        </div>
    {/each}
    </div>

    <div>====</div>

    <!-- <div>TIME: {$time}</div> -->


</div>
