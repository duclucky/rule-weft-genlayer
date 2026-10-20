/** Match a fixed diagnostic token in error fields; never expose decoded payloads. */
export function hasErrorMarker(receipt,marker){
 if(!/^[A-Z_]{2,64}$/.test(marker))return false;
 const fields=new Set(['consensus_data','leader_receipt','genvm_result','result','error','error_message','message','calldata','data','kind','code']);
 function visit(v,depth=0){if(depth>12)return false;if(Array.isArray(v))return v.some(x=>visit(x,depth+1));if(typeof v==='string'){if(v.includes(marker))return true;if(v.length<=1000000&&/^[A-Za-z0-9+/=]{12,}$/.test(v))return Buffer.from(v,'base64').toString('utf8').includes(marker);return false;}return !!v&&typeof v==='object'&&Object.entries(v).some(([k,x])=>fields.has(k)&&visit(x,depth+1));}
 return visit(receipt);
}
