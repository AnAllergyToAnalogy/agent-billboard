 export function formatDuration(time_ms: number): string{
    if(isNaN(Number(time_ms))){
        return "[unknown]"
    }
    function p(val: bigint){
        return val===1n?'':'s';
    }

    let time = BigInt(time_ms);

    const MILLISECOND = 1000n;
    const SECOND = 60n;
    const MINUTE = 60n;
    const HOUR = 24n;
    const DAY = 7n;

    const periods: any[] = [
        ["second",SECOND],
        ["minute",MINUTE],
        ["hour",HOUR],
        ["day",DAY]
    ]

    if(time < MILLISECOND){
        return "less than a second"   
    }
    time /= MILLISECOND;

    for(let period of periods){
        if(time < period[1]){
            return `${time} ${period[0]}${p(time)}`;
        }
        time /= period[1];

    }
    return `${time} week${p(time)}`;

}