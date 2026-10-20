/** Compile the API as deployed ESM and import its emitted files in native Node. */
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const result=spawnSync(process.execPath,[resolve('node_modules/typescript/bin/tsc'),'-p','frontend/api/tsconfig.json','--outDir','.codex/api-runtime'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status??1);
const {default:handler}=await import(pathToFileURL(resolve('.codex/api-runtime/api/genlayer-rpc.js')).href);
let status,body;
await handler({method:'GET'},{status(value){status=value;return this;},json(value){body=value;}});
if(status!==405||body?.error!=='POST required')throw Error('Emitted API entrypoint failed its method boundary');
console.log('API_EMIT_IMPORT_PASS: native Node ESM import and GET 405');
