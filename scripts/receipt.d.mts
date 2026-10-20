export function state(r:unknown):{status:string;execution:string;successful:boolean};
export function safeReceipt(r:unknown):{status:string;execution:string;successful:boolean;hash:string|null;from:string|null;to:string|null};
export function address(x:unknown):string|null;
export function hash(x:unknown):string|null;
