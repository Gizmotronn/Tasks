"""Deploy the static Piles frontend to the configured Cloudflare account.

CLOUDFLARE_API_TOKEN is consumed only through the authenticated API header.
The Worker contains public app assets, never credentials or user records.
"""
import json, os, pathlib, urllib.request, urllib.error, uuid
ROOT=pathlib.Path(__file__).resolve().parents[1]
API='https://api.cloudflare.com/client/v4'
NAME='tasks-piles'
def call(method,path,body=None,content_type='application/json'):
    req=urllib.request.Request(API+path,method=method,data=body,headers={'Authorization':'Bearer '+os.environ['CLOUDFLARE_API_TOKEN'],'User-Agent':'Tasks-Piles/1.0','Content-Type':content_type})
    try:
        with urllib.request.urlopen(req,timeout=60) as response: result=json.load(response)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'Cloudflare {method} {path}: HTTP {e.code}: {e.read().decode()}') from None
    if not result.get('success'):raise RuntimeError(str(result.get('errors')))
    return result['result']
config_path=ROOT/'cloudflare.json'
config=json.loads(config_path.read_text()) if config_path.exists() else {}
accounts=call('GET','/accounts')
account=config.get('account_id') or os.environ.get('CLOUDFLARE_ACCOUNT_ID')
if not account:
    if len(accounts)!=1:raise RuntimeError('Set CLOUDFLARE_ACCOUNT_ID to choose an account.')
    account=accounts[0]['id']
if account not in [a['id'] for a in accounts]:raise RuntimeError('Configured account is inaccessible.')
subdomain=call('GET',f'/accounts/{account}/workers/subdomain')['subdomain']
assets={}
for f in sorted((ROOT/'public').iterdir()):
    if f.is_file():assets['/'+f.name]=f.read_text()
assets['/']=assets['/index.html']
listing=(ROOT/'src/listings.js').read_text().replace('export ', '')
proxy=(ROOT/'src/pocketbase.js').read_text().replace('export ', '')
handler=(ROOT/'src/worker.js').read_text().replace("import {listingEndpoint} from './listings.js';\n",'').replace("import {pocketbaseProxy} from './pocketbase.js';\n",'')
worker='const assets='+json.dumps(assets)+';\n'+listing+'\n'+proxy+'\n'+handler
metadata={'main_module':'worker.mjs','compatibility_date':'2026-11-06'}
boundary='piles'+uuid.uuid4().hex
parts=[]
for name,filename,ctype,data in [('metadata',None,'application/json',json.dumps(metadata)),('worker.mjs','worker.mjs','application/javascript+module',worker)]:
    header=f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"'+(f'; filename="{filename}"' if filename else '')+f'\r\nContent-Type: {ctype}\r\n\r\n'
    parts.append((header+data+'\r\n').encode())
body=b''.join(parts)+f'--{boundary}--\r\n'.encode()
result=call('PUT',f'/accounts/{account}/workers/scripts/{NAME}',body,'multipart/form-data; boundary='+boundary)
call('POST',f'/accounts/{account}/workers/scripts/{NAME}/subdomain',json.dumps({'enabled':True,'previews_enabled':False}).encode())
url=f'https://{NAME}.{subdomain}.workers.dev'
config_path.write_text(json.dumps({'account_id':account,'worker_name':NAME,'url':url},indent=2)+'\n')
print(json.dumps({'url':url,'deployment_id':result.get('deployment_id'),'asset_count':len(assets)}))
