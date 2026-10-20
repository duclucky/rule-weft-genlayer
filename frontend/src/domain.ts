export type Address = `0x${string}`;
export type Provider = {request:(input:{method:string;params?:unknown[]})=>Promise<unknown>;on?:(event:string,fn:(value:unknown)=>void)=>void;removeListener?:(event:string,fn:(value:unknown)=>void)=>void};
export type Wallet = {id:string;name:string;provider:Provider};
export type Rule = {id:string;author:string;effect:'ALLOW'|'BLOCK';text:string;target:string;submitted:boolean;ratified:boolean};
export type Policy = {id:string;title:string;creator:string;issuer:string;status:string;digest:string;collectDeadline:number;expiry:number;rules:Rule[]};
export type RuleResult = {id:string;applicability:string;exception:string;label:string};
export type RequestItem = {id:string;policyId:string;policyTitle:string;payer:string;issuer:string;action:string;status:string;deadline:number;attempts:number;reason:string;rules:RuleResult[]};
export type Progress = 'Estimating network fees'|'Awaiting signature'|`Awaiting signature · network fee reserve ${string} GEN`|'Submitted'|'Accepted / decided'|'Finalized'|'Failed';
export type Command = 'create_policy'|'submit_rule'|'ratify'|'cancel_policy'|'open_request'|'review_request'|'consume'|'recover'|'withdraw';
export interface ContractAdapter {
 configured:boolean;
 policies():Promise<Policy[]>;
 policy(id:string):Promise<Policy>;
 requests():Promise<RequestItem[]>;
 request(id:string):Promise<RequestItem>;
 credit(address:string):Promise<string>;
 write(command:Command,args:unknown[],valueGEN:'0'|'1',progress:(p:Progress)=>void):Promise<void>;
}
export const deploymentMessage='Deployment is not configured yet. Live reads and transactions are unavailable.';
export class UnavailableAdapter implements ContractAdapter {
 configured=false;
 async policies():Promise<Policy[]>{throw new Error(deploymentMessage);}
 async policy(_id:string):Promise<Policy>{throw new Error(deploymentMessage);}
 async requests():Promise<RequestItem[]>{throw new Error(deploymentMessage);}
 async request(_id:string):Promise<RequestItem>{throw new Error(deploymentMessage);}
 async credit(_address:string):Promise<string>{throw new Error(deploymentMessage);}
 async write():Promise<void>{throw new Error(deploymentMessage);}
}
export const stateLabels:Record<string,string>={COLLECTING:'Collecting rules',RATIFYING:'Waiting for agreement',ACTIVE:'Open for requests',CANCELLED:'Draft cancelled',OPEN:'Ready for review',RETRYABLE:'Review needs another attempt',GRANTED:'Ready to use',DENIED:'Request declined',CONFLICT:'Rules need clarification',USED:'Permission used',EXPIRED:'Purchase recovered',IN:'Effective',OUT:'Overridden',UNDEC:'Unresolved exception',INACTIVE:'Outside this request'};
export const label=(value:string)=>stateLabels[value]??value;
export const same=(a:string,b:string)=>!!a&&a.toLowerCase()===b.toLowerCase();
export const short=(a:string)=>a?`${a.slice(0,6)}…${a.slice(-4)}`:'Not connected';
export const now=()=>Math.floor(Date.now()/1000);
export function actions(item:RequestItem,account:string,time=now()):Command[]{
 if(!same(item.payer,account))return [];
 if(time>=item.deadline&&['OPEN','RETRYABLE','GRANTED'].includes(item.status))return ['recover'];
 if(time>=item.deadline)return [];
 if(['OPEN','RETRYABLE'].includes(item.status))return ['review_request'];
 return item.status==='GRANTED'?['consume']:[];
}
