export class SaveQueue<T>{
private timer?:ReturnType<typeof setTimeout>;private pending?:T;private running=false;private disposed=false;
constructor(private save:(value:T)=>Promise<void>,private status:(s:'saving'|'saved'|'error')=>void){}
get dirty(){return this.pending!==undefined||this.running;}
put(value:T){this.pending=value;this.status('saving');clearTimeout(this.timer);this.timer=setTimeout(()=>void this.flush(),1000);}
async flush(){if(this.running||this.disposed||this.pending===undefined)return;clearTimeout(this.timer);const value=this.pending;this.pending=undefined;this.running=true;try{await this.save(value);if(!this.disposed)this.status(this.pending===undefined?'saved':'saving');}catch{if(this.pending===undefined)this.pending=value;if(!this.disposed)this.status('error');this.running=false;return;}this.running=false;if(this.pending!==undefined)void this.flush();}
dispose(){this.disposed=true;clearTimeout(this.timer);}
}