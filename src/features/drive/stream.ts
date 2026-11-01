import {accessToken,onToken} from './auth';
let tokenCleanup:(()=>void)|undefined;
export async function prepareStream():Promise<boolean>{
 if(!('serviceWorker' in navigator))return false;
 try{
 await navigator.serviceWorker.register('/sw.js');
 await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),4000))]);
 if(!navigator.serviceWorker.controller)await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>{navigator.serviceWorker.removeEventListener('controllerchange',changed);reject(new Error('timeout'));},4000);const changed=()=>{clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',changed);resolve();};navigator.serviceWorker.addEventListener('controllerchange',changed);});
 const send=(token:string)=>navigator.serviceWorker.controller?.postMessage({type:'TOKEN',token});
 tokenCleanup?.();tokenCleanup=onToken(send);send(await accessToken());
 return true;
 }catch{return false;}
}
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',e=>{
 if(e.data?.type==='TOKEN_REQUEST'){void accessToken(true).then(token=>e.source&&'postMessage' in e.source&&e.source.postMessage({type:'TOKEN_REPLY',requestId:e.data.requestId,token})).catch(()=>e.source&&'postMessage' in e.source&&e.source.postMessage({type:'TOKEN_REPLY',requestId:e.data.requestId,token:''}));}
});
