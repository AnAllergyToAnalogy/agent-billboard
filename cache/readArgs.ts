// required = [what,they,should,be.returned,as]

// optional = [ -a, -b, -c]
//   will be returned as
//    a
//    b
//    c

export function readArgs(required: string[] = [], optional:string[] = [], flags:string[] = [], help: boolean = false): {[key: string]: string}{


    let duplicateNameCheck: {[key: string]: boolean} = {};
    const all = [...required,...optional,...flags];
    if(help && all.includes('help')){
        throw new Error(`Duplicate "help" argument defined by program.`);
    }
    all.forEach(r =>{
        if(duplicateNameCheck[r]){
            throw new Error(`Duplicate argument defined by program: ${r}`);
        }
        duplicateNameCheck[r] = true;
    })

    const passed = process.argv.slice(2);
    
    if(help && passed.includes('-help')){
        return {
            help: "true"
        }
    }


    const passedRequired: string[] = [];
    const parsed: {[key: string]: string} = {}
    ;
    //Step through and add to parsed array
    for(let i = 0; i < passed.length; i++){
        const arg = passed[i];
        
        if(arg.substring(0,1) === "-"){
            const argName = arg.substring(1);
            if(flags.includes(argName)){
                //It was a flag. 
                parsed[argName] = "true";
            }else if(optional.includes(argName)){
                // It was an optiona arg that exists
                // so the next one was the value
                i++;
                if(passed.length === i){
                    throw new Error(`Missing value for optional param: ${arg}`);
                }
                const argValue = passed[i];
                parsed[argName] = argValue;

            }else{
                //It was just a regular arg that happened to lead with a  -
                passedRequired.push(arg);
            }

        }else{
            // It was just a normal param
            passedRequired.push(arg);
        }
    }

    if(passedRequired.length > required.length){
        throw new Error(`Received excess non-named arguments. Expected ${required.length}, received ${passedRequired.length}.`);
    }

    if(passedRequired.length < required.length){
        const argNum = passedRequired.length;
        throw new Error(`${required.length} arguments required. Did not receive value for required argument ${argNum}: ${required[argNum]}`  );
    }

    for(let i = 0; i < passedRequired.length; i++){
        parsed[required[i]] = passedRequired[i];
    }
    

    return parsed;
}
