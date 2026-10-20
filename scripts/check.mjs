import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const win=process.platform==='win32',python=win?'.venv/Scripts/python.exe':'.venv/bin/python';
const steps=[[python,['scripts/lint_runtime.py','check','contracts/rule_weft.py']],[python,['-m','pytest','tests/direct','tests/tooling','-q','--tb=short']],[process.execPath,['--test',...readdirSync('scripts').filter(f=>f.endsWith('.test.mjs')).map(f=>'scripts/'+f)]],[win?'npm.cmd':'npm',['run','check','--workspace','frontend']]];
for(const [command,args] of steps){const r=spawnSync(command,args,{stdio:'inherit',env:{...process.env,PYTHONUTF8:'1'},shell:win&&command==='npm.cmd'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);}
mkdirSync('.codex',{recursive:true});const result={at:new Date().toISOString(),command:'npm run check',exitCode:0,sourceSha256:createHash('sha256').update(readFileSync('contracts/rule_weft.py')).digest('hex')};writeFileSync('.codex/last-check.json',JSON.stringify(result,null,2)+'\n');console.log('RULEWEFT_CHECK_PASS: semantic lint, direct and metadata tests, receipt parser, frontend tests/typecheck/build.');
