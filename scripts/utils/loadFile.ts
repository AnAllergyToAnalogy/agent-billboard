import fs from "fs";

export function loadFile(location: string, parseJson: boolean = false): any{
    const data = fs.readFileSync(location, {
        encoding: 'utf8'
    });

    if(parseJson){
        return JSON.parse(data);
    }
    
    return data;
}