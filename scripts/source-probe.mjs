import {createHash} from 'node:crypto';
import {mkdir,writeFile,access} from 'node:fs/promises';
const url='https://www.w3.org/TR/2018/REC-odrl-model-20180215/';
const out=new URL('../docs/evidence/local/source-probe.json',import.meta.url);
try{await access(out);throw new Error('SourceEvidenceAlreadyExists');}catch(e){if(e.code!=='ENOENT')throw e;}
const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
const bytes=new Uint8Array(await response.arrayBuffer());
const text=new TextDecoder().decode(bytes);
const record={at:new Date().toISOString(),command:'node scripts/source-probe.mjs',url,http:response.status,length:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),identityOK:text.includes('ODRL Information Model')&&text.includes('2018'),scope:'Local HTTP source acquisition only, no GenVM finality or legal-compliance proof'};
await mkdir(new URL('../docs/evidence/local/',import.meta.url),{recursive:true});await writeFile(out,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify(record));if(record.http!==200||!record.identityOK||record.length>300000)process.exitCode=1;
