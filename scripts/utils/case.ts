export function camelToSnake(name: string){
    let snaked = "";
    for(let i = 0; i < name.length; i++){
        const s = name[i];
        const l = name[i].toLowerCase();
        if(s === l){
            snaked += s;
        }else{
            snaked += "_"+l;
        }
    }
    return snaked;
}
export function snakeToCamel(name: string){
    const params = name.split("_");
    for(let i = 1; i < params.length; i++){
        const p = params[i];
        params[i] = p.substring(0,1).toUpperCase() + p.substring(1);
    }
    return params.join("");
}
export function pascalToCamel(name: string){
    return name.substring(0,1).toLowerCase()+name.substring(1);
}
export function camelToPascal(name: string){
    return name.substring(0,1).toUpperCase()+name.substring(1);
}
export function snakeToPascal(name: string){
    return camelToPascal(snakeToCamel(name));
}
export function pascalToSnake(name: string): string{
    return camelToSnake(pascalToCamel(name))
}
