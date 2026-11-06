"""Additive schema installer; never changes existing collections. No user records created."""
import json, os, sys, urllib.request, urllib.error
base=os.environ['POCKETBASE_URL'].rstrip('/')
def call(method,path,data=None,token=None):
    req=urllib.request.Request(base+path,method=method,data=json.dumps(data).encode() if data is not None else None,headers={'User-Agent':'Tasks-Piles/1.0','Accept':'application/json','Content-Type':'application/json',**({'Authorization':token} if token else {})})
    try:
        with urllib.request.urlopen(req,timeout=45) as r:return json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'{method} {path}: HTTP {e.code}: {e.read().decode()}') from None
offline='--offline' in sys.argv
token=None
existing={}
users='EXPLORE_USERS_ID'
if not offline:
    token=call('POST','/api/collections/_superusers/auth-with-password',{'identity':os.environ['POCKETBASE_SUPERUSER_EMAIL'],'password':os.environ['POCKETBASE_SUPERUSER_PASSWORD']})['token']
    existing={c['name']:c for c in call('GET','/api/collections?perPage=200',token=token)['items']}
    users=existing['explore_users']['id']
rule='@request.auth.collectionName = "explore_users" && owner = @request.auth.id'
for name in ['piles_events','piles_roadmaps','piles_milestones','piles_listing_sources','piles_listings','piles_reward_receipts']:
    schema={'name':name,'type':'base','listRule':rule,'viewRule':rule,'createRule':rule,'updateRule':None,'deleteRule':None,'fields':[{'name':'owner','type':'relation','collectionId':users,'required':True,'maxSelect':1,'cascadeDelete':False},{'name':'event_id','type':'text','required':True,'max':80},{'name':'event','type':'json','required':True,'maxSize':100000},{'name':'created','type':'autodate','onCreate':True,'onUpdate':False}], 'indexes':[f'CREATE UNIQUE INDEX idx_{name}_owner_event ON {name} (owner, event_id)']}
    if name in existing:
        cur=existing[name]
        for key in ['listRule','viewRule','createRule','updateRule','deleteRule']:
            if cur.get(key)!=schema[key]:raise RuntimeError(f'{name}: permission mismatch; refusing modification')
        print('verified',name)
    elif not offline:
        call('POST','/api/collections',schema,token);print('created',name)
    # Persist the portable schema without secrets or server-specific relation IDs.
    schema['fields'][0]['collectionId']='EXPLORE_USERS_ID'
    os.makedirs('pocketbase',exist_ok=True)
    with open(f'pocketbase/{name}.json','w') as f:json.dump(schema,f,indent=2)
print('Schema ready; existing applications and user data unchanged.')
