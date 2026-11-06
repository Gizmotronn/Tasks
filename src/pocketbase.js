const DATABASE='https://623400kn020ozyj.pwz5.pocketbasecloud.com';
export async function pocketbaseProxy(request,{fetcher=fetch}={}){
 const url=new URL(request.url),path=url.pathname.slice('/api/pocketbase'.length);
 const authPath=path==='/api/collections/explore_users/auth-with-password';
 const refreshPath=path==='/api/collections/explore_users/auth-refresh';
 const recordsPath=path==='/api/collections/piles_events/records';
 const respond=(body,status)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(!(request.method==='POST'&&(authPath||refreshPath||recordsPath)||request.method==='GET'&&recordsPath))return respond({message:'Endpoint not available.'},404);
 if(request.method==='POST'&&request.headers.get('Origin')!==url.origin)return respond({message:'Open Piles to make this request.'},403);
 const headers={'Content-Type':'application/json','Accept':'application/json','User-Agent':'Tasks-Piles/1.0'};
 if(!authPath){const token=request.headers.get('Authorization');if(!token||token.length>5000)return respond({message:'Sign in to sync.'},401);headers.Authorization=token;}
 let body;
 if(request.method==='POST'){
  if(Number(request.headers.get('Content-Length')||0)>120000)return respond({message:'Request too large.'},413);
  body=await request.text();if(body.length>120000)return respond({message:'Request too large.'},413);
  try{const data=body?JSON.parse(body):{};if(authPath&&data.identity?.toLowerCase()!=='liam@skinetics.tech')return respond({message:'Use Liam’s Explore account.'},403);}catch{return respond({message:'Invalid request.'},400);}
 }
 try{
  const upstream=await fetcher(DATABASE+path+url.search,{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(15000)});
  if(!upstream.headers.get('Content-Type')?.includes('application/json'))return respond({message:'PocketBase returned an unexpected response. Please retry.'},502);
  return new Response(upstream.body,{status:upstream.status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return respond({message:'PocketBase is temporarily unreachable. Your changes remain saved on this device.'},503);}
}
