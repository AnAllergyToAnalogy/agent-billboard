import {derived,  writable} from 'svelte/store';

function fnv32a() {
    let str = JSON.stringify(arguments);
    let hval = 0x811c9dc5;
    for ( let i = 0; i < str.length; ++i )
    {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return hval >>> 0;
}

export function id(){
    //@ts-ignore
    return (fnv32a(arguments,Date.now())).toString();
}

export type Variable = {
        value: any,
        type: string,
        initial: boolean,
        loading: boolean,
        loaded:  boolean,
        error:   boolean,
        state: "initial" | "loading" | "loaded" | "error"
}

export function Loadable(type: string,initial: any){
    const variable: Variable = {
        value: null,
        type: type,
        initial: true,
        loading: false,
        loaded:  false,
        error:   false,
        state: "initial", //initial, loading, loaded, error
    }
    if(typeof initial !== "undefined") {
        variable.value = initial;
    }else {
        switch(type){
            case "boolean":
                variable.value = false;
                break;
            case "string":
                variable.value = "";
                break;
            case "number":
                variable.value = 0;
                break;
            case "bigInt":
                variable.value = 0n;
                break;
            case "array":
                variable.value = [];
                break;
            case "object":
                variable.value = {};
                break;
        }
    }
    return variable;
}

export function readObject(variable: string,prop: string){
    return _data[variable].value[prop];
}
export function hasProperty(variable: string,prop: string){
    return typeof _data[variable].value[prop] !== "undefined";
}

export let _data = {}  as {[key: string]: any;}
export let data = writable(_data);

// export let values = derived(data)
//TODO have values be a derived stored that is just the current value
export const values = derived(data, ($data) => {
    const _values: {[key:string]: any} = {};
    for(let i in $data){
        _values[i] = $data[i].value;
    }
    return _values as {[key: string]: any;};
})


let stateId = 0;

export const Data = {
    loadData:           $loadData,
    loadDatas:          $loadDatas,
    setData:            $setData,
    getData:            $getData,
    loading:            $loading,
    loaded:             $loaded,
    error:              $error,
    initial:            $initial,

    isLoaded:           $isLoaded,
    safeIncrement:      $safeIncrement,
    safeDecrement:      $safeDecrement,
    safeUpdate:         $safeUpdate,

    safeSetObjProp:     $safeSetObjProp,
    safeDeleteObjProp:  $safeDeleteObjProp,
    safePush:           $safePush,
    safeRemove:         $safeRemove,
}

async function $loadData(property: string,loadFunc: Function){
    let _stateId = stateId;
    $loading(property,_stateId);
    try{
        const value = await loadFunc();
        $setData(property,value,_stateId);
        $loaded(property,_stateId);
    }catch(e){
        $error(property,_stateId);
    }
}
async function $loadDatas(properties: string[],loadFunc: Function){
    let _stateId = stateId;
    properties.map(property => {
        $loading(property,_stateId)
    });

    try{
        const values = await loadFunc();
        properties.map(property => {
            $setData(property,values[property],_stateId,false);
        });

        properties.map(property => {
            $loaded(property,_stateId,false);
        });

        data.set(_data);
    }catch(e){
        // console.log("failed to load datas")
        // console.log(e);
        properties.map(property => {
            $error(property,_stateId);
        });
    }
}
function $setData(property: string,value: any, _stateId = stateId, updateWritable = true){
    if(_stateId !== stateId) return;

    if(_data[property].type !== "object"){
        _data[property].value = value;

    }else{
        _data[property].value = value;
    }

    if(updateWritable){
        data.set(_data);
    }else{
    }

}
function $getData(property: string){
    return _data[property].value;
}
function $loading(property: string, _stateId = stateId){
    if(_stateId !== stateId) return;
    _data[property].state = 'loading';

    _data[property].initial = false;
    _data[property].loading = true;
    _data[property].loaded =  false;
    _data[property].error =   false;

    data.set(_data);
}
function $loaded(property: string, _stateId = stateId, updateWritable = true){
    if(_stateId !== stateId) return;
    _data[property].state = 'loaded';

    _data[property].initial = false;
    _data[property].loading = false;
    _data[property].loaded =  true;
    _data[property].error =   false;
    if(updateWritable){
        data.set(_data);
    }

}
function $error(property: string, _stateId = stateId){
    if(_stateId !== stateId) return;
    _data[property].state = 'error';

    _data[property].initial = false;
    _data[property].loading = false;
    _data[property].loaded =  false;
    _data[property].error =   true;

    data.set(_data);
}
function $initial(property: string, _stateId = stateId){
    if(_stateId !== stateId) return;
    _data[property].state = 'initial';

    _data[property].initial = true;
    _data[property].loading = false;
    _data[property].loaded =  false;
    _data[property].error =   false;

    data.set(_data);
}
function $isLoaded(property: string){
    return _data[property].loaded;
}

function $safeIncrement(property: string){
    if($isLoaded(property)){
        let _value = $getData(property);
        _value++;
        $setData(property,_value);
    }
}
function $safeDecrement(property: string){
    if($isLoaded(property)){
        let _value = $getData(property);
        _value--;
        $setData(property,_value);
    }
}
function $safeUpdate(property: string,value: any){
    if($isLoaded(property)){
        $setData(property,value);
    }
}

function $safeSetObjProp(property: string,objProp: string,value: any){
    if($isLoaded(property)){
        let _value = $getData(property);
        _value[objProp] = value;
        $setData(property,_value);
    }
}
function $safeDeleteObjProp(property: string,objProp: string){
    if($isLoaded(property)){
        let _value = $getData(property);
        delete _value[objProp];
        $setData(property,_value);
    }
}


function $safePush(property: string,value: any){
    if($isLoaded(property)){
        let _array = $getData(property);
        _array.push(value);
        $setData(property,_array);
    }else{
        console.log("PUSH: NOT LOADED");
    }
}
function $safeRemove(property: string,value: any){
    if($isLoaded(property)){
        let _array = $getData(property);
        let _index = _array.indexOf(value);

        if(_index !== -1){
            _array.splice(_array.indexOf(value),1);
            $setData(property,_array);
        }else{
            console.log("REMOVE: not found")
        }
    }else{
        console.log("REMOVE: NOT LOADED");
    }
}



let _dataStructure:  {[key: string]: any;};
export let initData = function(dataStructure:  {[key: string]: any;}){
    _dataStructure = dataStructure;
    for(let d in dataStructure){
        //@ts-ignore
        _data[d] = Loadable(...dataStructure[d]);
    }
    data.set(_data);
}
export let resetData = function(){
    initData(_dataStructure);
}
