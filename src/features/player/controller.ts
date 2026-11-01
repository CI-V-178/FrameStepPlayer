import {clampFrame,frameAt,frameTime} from '../../shared/time';
/** Only one seek and one pending destination exist at any time. */
export class FrameController{
 frame=0;private busy=false;private pending?:number;private disposed=false;
 private release?:()=>void;
 constructor(private video:HTMLVideoElement,private changed:(frame:number)=>void){}
 sync(){if(!this.busy){this.frame=clampFrame(frameAt(this.video.currentTime),this.video.duration||0);this.changed(this.frame);}}
 step(d:number){this.video.pause();this.frame=clampFrame(this.frame+d,this.video.duration||0);this.changed(this.frame);this.enqueue(this.frame);}
 jump(frame:number){this.video.pause();this.frame=clampFrame(frame,this.video.duration||0);this.changed(this.frame);this.enqueue(this.frame);}
 private enqueue(frame:number){if(this.disposed)return;if(this.busy){if(this.pending===undefined)this.pending=frame;else{this.frame=this.pending;this.changed(this.frame);}return;}void this.seek(frame);}
 private async seek(frame:number){
 this.busy=true;const v=this.video,target=frameTime(frame,v.duration||0);
 if(Math.abs(v.currentTime-target)>1e-7){
 await new Promise<void>(resolve=>{let finished=false;let callback:number|undefined;let timer:ReturnType<typeof setTimeout>;
 const finish=()=>{if(finished)return;finished=true;clearTimeout(timer);v.removeEventListener('seeked',seeked);if(callback!==undefined)v.cancelVideoFrameCallback(callback);this.release=undefined;resolve();};
 const seeked=()=>{if(!v.requestVideoFrameCallback)finish();};
 v.addEventListener('seeked',seeked);if(v.requestVideoFrameCallback)callback=v.requestVideoFrameCallback(()=>finish());timer=setTimeout(finish,150);this.release=finish;
 try{v.currentTime=target;}catch{finish();}
 });
 }
 this.busy=false;if(this.pending!==undefined&&!this.disposed){const next=this.pending;this.pending=undefined;await this.seek(next);}
 }
 get seeking(){return this.busy;}
 dispose(){this.disposed=true;this.pending=undefined;this.release?.();}
}
