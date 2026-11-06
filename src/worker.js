import {listingEndpoint} from './listings.js';
export default {
 async fetch(request) {
  const path=new URL(request.url).pathname;
  if(path==='/api/listing')return listingEndpoint(request);
  const headers={
   'X-Content-Type-Options':'nosniff',
   'Referrer-Policy':'no-referrer',
   'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://623400kn020ozyj.pwz5.pocketbasecloud.com; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'",
   'Cache-Control':'no-cache'
  };
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{...headers,Allow:'GET, HEAD'}});
  if(!Object.hasOwn(assets,path))return new Response('Not found',{status:404,headers});
  const ext=path.split('.').pop();
  headers['Content-Type']=({'html':'text/html; charset=utf-8','js':'text/javascript; charset=utf-8','css':'text/css; charset=utf-8','svg':'image/svg+xml','webmanifest':'application/manifest+json'})[ext]||(path==='/'?'text/html; charset=utf-8':'text/plain');
  if(path==='/sw.js')headers['Service-Worker-Allowed']='/';
  return new Response(request.method==='HEAD'?null:assets[path],{headers});
 }
};
