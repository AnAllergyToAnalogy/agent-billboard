export function formatDuration(time_ms: number): string{
    if(isNaN(Number(time_ms))){
        return "[unknown]"
    }
    function p(val: number){
        return val===1?'':'s';
    }
    if (time_ms < 1000){
        return "less than a second"
    }else if(time_ms < 60_000){
        let seconds = Math.floor(time_ms/1000);
        return `${seconds} second${p(seconds)}`;
        
    }else if(time_ms < 3_600_000){
        let minutes = Math.floor(time_ms/60_000);
        return `${minutes} minute${p(minutes)}`;
    }else if(time_ms < 216_000_000){
        let hours = Math.floor(time_ms/3_600_000);
        return `${hours} hour${p(hours)}`
    }else{
        let days = Math.floor(time_ms/216_000_000);
        return `${days} day${p(days)}`
    }

}
