<script lang="ts">
    import { lamportsToSol } from 'kit-squared';


    //@ts-ignore
	import type { PageProps } from './$types';
    import { formatDuration } from '$lib/ui';
    let { data }: PageProps = $props();

    let history = data.history;

    let pageLoadTime = Date.now();

    for(let i in history){
        history[i].ago = formatDuration(pageLoadTime - history[i].timestamp)
    }

</script>

{#if  true}
<style> 

    *{
        font-family: "Roboto Mono", monospace;
        font-optical-sizing: auto;
        /* font-weight: <weight>; */
        font-style: normal;

        padding: 0;
        margin: 0;
    }

    p{
        margin-top:15px;
    }

    html{
        background: lightblue;
    }
    body{


        display: flex;
        flex-direction: column;   
        align-items: center;
    
        margin: 0;

        padding: 0 20px;
        padding-top:90px;

        display: flex;
        flex-direction: column;

        font-family: Arial, Helvetica, sans-serif;
    }

    section{
        display: flex;
        flex-direction: column;

        overflow: hidden;

        width: 480px; 
        max-width:calc(100vw - 60px);

        background: white;

        color:black;
        border: solid white 5px;



        margin-bottom: 30px;


        padding-bottom:50px;

        background: white;
        outline: solid 5px black;
        padding: 15px 15px;

        box-shadow: 10px 10px 2px rgba(0,0,0,0.5);
    }

    
    h1, h2, h3{
        text-align: center;
    }

    h2{
        padding-bottom:5px;
    }
    h3{
        padding-top: 10px;
        padding-bottom: 5px;
    }

    textarea{
        width: calc(100% - 20px);
        /* height: auto; */

        field-sizing: content;

        padding: 10px;
        background: #FFF7D4;

        margin-bottom:20px;
    }
    button{

        cursor: pointer;
        font-size: 12px;
        padding: 5px 10px;
        border: black solid 2px;

        color:white;
        background: black;

        margin-bottom: 20px;
    }
    button:hover{
        color: black;
        background: white;
    }

    small{
        color: #B02C00;
    }

    select{
        margin: 5px 0 10px 0;
    }
    input{
        padding: 5px 10px;
        margin: 5px 0 10px 0;
    }
    input:focus{
        background: #FFF7D4;
    }

    label{
        margin-top:20px;
    }

</style>
{/if}


<section>
    <a href="/">
        <h1>📠 The Agent Billboard 📠</h1>
    </a>
</section>


<section>
        <h2>Acquisition History</h2>

        {#each history as item}

            <p>Acquired by </p>
            <h4>
                <a href="https://explorer.solana.com/address/{item.poster}">{item.poster}</a>
            </h4> 
            <p>{lamportsToSol(item.amount)} SOL</p>
            <small>{formatDuration(pageLoadTime - item.timestamp)} ago</small>
            <p>----------------</p>
            <br/>
        {/each}



        <small>
             Data available in raw json format at <br/><a href="https://i.xn--5t8h.ws/history.json">https://ℹ️.📠.ws/history.json</a>
        </small>


</section>