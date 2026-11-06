// All accounting uses integer minor units. Recommendations never move real money.
export function plan(items, available, today = new Date().toISOString().slice(0,10)) {
 if (!Number.isSafeInteger(available) || available < 0) throw Error('Invalid spend pile');
 let remaining = available;
 return items.filter(i=>!i.archived).map(i=>{
  const gap=Math.max(0,i.target-i.saved);
  const days=i.deadline?Math.max(1,Math.ceil((Date.parse(i.deadline+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000)):null;
  return {...i,gap,days,weekly:days?Math.ceil(gap/Math.max(1,Math.ceil(days/7))):0};
 }).sort((a,b)=>b.priority-a.priority || (a.deadline||'9999').localeCompare(b.deadline||'9999') || a.id.localeCompare(b.id)).map(i=>{
  const suggested=Math.min(remaining,i.weekly);remaining-=suggested;
  return {...i,suggested,shortfall:i.weekly-suggested,overdue:!!i.deadline&&i.deadline<today&&i.gap>0};
 });
}
export function project(events){
 const state={items:[],spend:0,rewards:[],watches:[],listings:[],collections:[],memberships:{}};const seen=new Set();
 for(const e of [...events].sort((a,b)=>a.at.localeCompare(b.at)||a.id.localeCompare(b.id))){
  if(seen.has(e.id))continue;seen.add(e.id);
  if(e.type==='item'&&!state.items.some(i=>i.id===e.data.id))state.items.push({...e.data,saved:0});
  if(e.type==='collection'&&!state.collections.some(c=>c.id===e.data.id))state.collections.push(e.data);
  if(e.type==='listing_saved'){
   if(!state.listings.some(l=>l.id===e.data.listing.id))state.listings.push(e.data.listing);
   if(e.data.item&&!state.items.some(i=>i.id===e.data.item.id))state.items.push({...e.data.item,saved:0});
   state.memberships['listing:'+e.data.listing.id]=e.data.collectionIds||[];
   if(e.data.item)state.memberships['item:'+e.data.item.id]=e.data.collectionIds||[];
  }
  if(e.type==='membership')state.memberships[e.data.kind+':'+e.data.id]=[...new Set(e.data.collectionIds)];
  if(e.type==='deposit'&&Number.isSafeInteger(e.data.amount)&&e.data.amount>0)state.spend+=e.data.amount;
  if(e.type==='allocate'){
   const i=state.items.find(i=>i.id===e.data.itemId),a=e.data.amount;
   if(i&&Number.isSafeInteger(a)&&a>0&&a<=state.spend&&a<=i.target-i.saved){state.spend-=a;i.saved+=a;}
  }
  if(e.type==='progress'&&!state.rewards.some(r=>r.milestoneId===e.data.milestoneId))state.rewards.push(e.data);
  if(e.type==='watch')state.watches.push(e.data);
 }
 return state;
}
