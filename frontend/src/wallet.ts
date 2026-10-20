import type {Provider,Wallet} from './domain';
type Announcement={info:{uuid:string;name:string};provider:Provider};
export function discoverWallets(onChange:(wallets:Wallet[])=>void):()=>void{
 const found=new Map<Provider,Wallet>();
 const add=(id:string,name:string,provider:Provider|undefined)=>{if(!provider?.request)return;const prior=[...found.values()].find(w=>w.provider===provider||w.name.toLowerCase()===name.toLowerCase());if(prior)return;found.set(provider,{id,name,provider});onChange([...found.values()]);};
 const listener=(event:Event)=>{const d=(event as CustomEvent<Announcement>).detail;if(d?.info?.uuid&&d.info.name)add(d.info.uuid,d.info.name,d.provider);};
 window.addEventListener('eip6963:announceProvider',listener);
 window.dispatchEvent(new Event('eip6963:requestProvider'));
 const w=window as unknown as {ethereum?:Provider&{providers?:Provider[];isMetaMask?:boolean;isRabby?:boolean;isBraveWallet?:boolean;isCoinbaseWallet?:boolean};okxwallet?:Provider;rabby?:Provider;coinbaseWalletExtension?:Provider};
 const providers=w.ethereum?.providers??(w.ethereum?[w.ethereum]:[]);
 providers.forEach((p,i)=>{const flags=p as typeof w.ethereum;add(`injected-${i}`,flags?.isRabby?'Rabby':flags?.isCoinbaseWallet?'Coinbase Wallet':flags?.isBraveWallet?'Brave Wallet':flags?.isMetaMask?'MetaMask':'Browser wallet',p);});
 add('okx','OKX Wallet',w.okxwallet);add('rabby','Rabby',w.rabby);add('coinbase','Coinbase Wallet',w.coinbaseWalletExtension);
 return ()=>window.removeEventListener('eip6963:announceProvider',listener);
}
export async function connect(wallet:Wallet):Promise<string>{
 let accounts:unknown;
 try{accounts=await wallet.provider.request({method:'eth_requestAccounts'});}catch(e){const code=Number((e as {code?:unknown})?.code);throw new Error(code===4001?'The wallet connection was declined. Open your wallet to unlock it, then try again.':code===-32002?'A connection request is already open in your wallet. Complete it there first.':`The wallet could not connect${Number.isSafeInteger(code)?` (code ${code})`:''}. Open your wallet and check its connection request.`);}
 if(!Array.isArray(accounts)||typeof accounts[0]!=='string'||!/^0x[0-9a-fA-F]{40}$/.test(accounts[0]))throw new Error('The selected wallet did not return a valid account.');
 await ensureChain(wallet.provider);return accounts[0];
}
export async function ensureChain(provider:Provider){
 const id=await provider.request({method:'eth_chainId'});if(id==='0xf22d')return;
 try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xf22d'}]});}
 catch(error){if(![4902,-32603].includes(Number((error as {code?:number}).code)))throw error;
  await provider.request({method:'wallet_addEthereumChain',params:[{chainId:'0xf22d',chainName:'GenLayer Studio Dev',nativeCurrency:{name:'GEN',symbol:'GEN',decimals:18},rpcUrls:['https://studio-next.genlayer.com/api'],blockExplorerUrls:['https://explorer-studio-dev.genlayer.com']}]});
 }
 if(await provider.request({method:'eth_chainId'})!=='0xf22d')throw new Error('Switch your wallet to Studio Dev before continuing.');
}
