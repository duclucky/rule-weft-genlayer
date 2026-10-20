/** Bounded read-only retry; never wrap signing, broadcasting or adjudication. */
export async function retryRead(read,{pause=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 for(let attempt=0;;attempt++)try{return await read();}catch(error){let retry=false,seen=new Set();for(let e=error;e&&typeof e==='object'&&!seen.has(e);e=e.cause){seen.add(e);if([-32029,-32005,-32006,429].includes(e.code)||e.status===429||e.name==='TimeoutError'||e instanceof TypeError&&e.message==='fetch failed')retry=true;}if(!retry||attempt>=3)throw error;await pause(10000*(attempt+1));}
}
