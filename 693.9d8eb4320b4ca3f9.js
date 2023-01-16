"use strict";(self.webpackChunkdnd_angular=self.webpackChunkdnd_angular||[]).push([[693],{3693:(R,g,i)=>{i.r(g),i.d(g,{ItemsModule:()=>M});var I=i(4466),u=i(5189),_=i(5529),d=i(5415);const p={G:"adventuring gear",TG:"trade good",FD:"food & drink",TAH:"tack & harness",AT:"artisan's tools",GS:"gaming set",T:"tool",INS:"musical instrument",MNT:"mount",AIR:"vehicle (air)",VEH:"vehicle (land)",SHP:"vehicle (water)",$:"treasure",M:"melee weapon",R:"ranged weapon",A:"ammunition",LA:"light armor",MA:"medium armor",HA:"heavy armor",RG:"ring",RD:"rod",WD:"wand",S:"shield",SCF:"spellcasting focus",AEN:"armor enchantment",WEN:"weapon enchantment",P:"consumable",SC:"consumable",EXP:"consumable",WON:"wondrous item",OTH:"other",SB:"spellbook"};var e=i(2096),s=i(9808),y=i(5601),h=i(9354);function A(r,a){1&r&&(e.ynx(0),e._uU(1,","),e.BQk())}function v(r,a){if(1&r&&(e.ynx(0),e.TgZ(1,"span"),e._uU(2),e.ALo(3,"number"),e.qZA(),e.YNc(4,A,2,0,"ng-container",0),e.BQk()),2&r){const t=e.oxw(2);e.xp6(1),e.Tol("text--"+(t.item.value/100>=1?"gp":t.item.value/10>=1?"sp":"cp")),e.xp6(1),e.AsE(" ",e.Dn7(3,5,t.item.value/100>=1?t.item.value/100:t.item.value/10>=1?t.item.value/10:t.item.value,"1.0","en-US")," ",t.item.value/100>=1?"gp":t.item.value/10>=1?"sp":"cp"," "),e.xp6(2),e.Q6J("ngIf",t.item.value&&t.item.weight)}}function b(r,a){if(1&r&&(e.ynx(0),e._uU(1),e.BQk()),2&r){const t=e.oxw(2);e.xp6(1),e.hij(" ",t.item.weight+" lbs."," ")}}function w(r,a){if(1&r&&(e.ynx(0),e._uU(1),e.BQk()),2&r){const t=e.oxw(2);e.xp6(1),e.hij(" ",t.getItemDamage(t.item)," ")}}function x(r,a){if(1&r&&(e.ynx(0),e.TgZ(1,"div",1),e.TgZ(2,"div",2),e.TgZ(3,"div",3),e.TgZ(4,"div"),e.ALo(5,"lowercase"),e.TgZ(6,"div",4),e.TgZ(7,"div",5),e.TgZ(8,"h1",6),e.ALo(9,"lowercase"),e.ALo(10,"sanitizeHtml"),e.qZA(),e.qZA(),e.TgZ(11,"div",5),e.TgZ(12,"h3"),e.ALo(13,"lowercase"),e._uU(14),e.qZA(),e.qZA(),e.qZA(),e.TgZ(15,"div",4),e.TgZ(16,"div",5),e.TgZ(17,"h5"),e.TgZ(18,"em"),e._uU(19),e.qZA(),e.qZA(),e.qZA(),e.qZA(),e.TgZ(20,"div",7),e.TgZ(21,"div",5),e.TgZ(22,"p",8),e.YNc(23,v,5,9,"ng-container",0),e.YNc(24,b,2,1,"ng-container",0),e.qZA(),e.qZA(),e.TgZ(25,"div",5),e.TgZ(26,"p",9),e.YNc(27,w,2,1,"ng-container",0),e.qZA(),e.qZA(),e.qZA(),e.qZA(),e.TgZ(28,"div",10),e.TgZ(29,"div",5),e._UZ(30,"entry-renderer",11),e.qZA(),e.qZA(),e.qZA(),e.qZA(),e.qZA(),e.BQk()),2&r){const t=e.oxw();e.xp6(4),e.Tol(e.lcZ(5,14,"item-header item-header-"+t.item.id)),e.xp6(4),e.Tol(e.lcZ(9,16,"color-primary")),e.Q6J("innerHtml",e.lcZ(10,18,t.item.name),e.oJD),e.xp6(4),e.Tol(e.lcZ(13,20,"pull-right color-"+t.item.source)),e.xp6(2),e.Oqu(t.item.source),e.xp6(5),e.Oqu(t.getItemInfo(t.item)),e.xp6(4),e.Q6J("ngIf",t.item.value),e.xp6(1),e.Q6J("ngIf",t.item.weight),e.xp6(3),e.Q6J("ngIf",t.item.dmg1),e.xp6(3),e.Q6J("list",t.item.entries)("parent","")}}let Z=(()=>{class r{constructor(){this.damageType={B:"bludgeoning",P:"piercing",S:"slashing"},this.itemProps={A:"ammunition",F:"finesse","2H":"two-handed",L:"light",H:"heavy",R:"reach",S:"special",LD:"loading",V:"versatile"}}isSimpleList(t){return"string"==typeof t[0]}getEntryType(t){return t.type?"list"==t.type?"list":"table"==t.type?"table":"item"==t.type?"item":"entries"==t.type?"entries":void 0:""}getItemDamage(t){let n="";if(n+=t.dmg1,n+=" "+this.damageType[t.dmgType],t.property){let o=[];t.property.forEach(l=>{switch(l){case"A":o.push("ammunition ("+t.range+")");break;case"T":o.push("thrown ("+t.range+")");break;case"T":o.push("versatile ("+t.dmg2+")");break;default:o.push(this.itemProps[l])}}),n+=" - "+o.join(", ")}return n}getItemInfo(t){let n=[];return n.push(this.getItemType(t)),n.push(this.getItemRarity(t)),n.filter(Boolean).join(", ")}getItemType(t){let n="";if(t.wondrous&&t.type)n+="Wondrous item, ";else if(t.wondrous)return"Wondrous item";switch(t.type){case"M":t.weaponCategory&&t.baseItem?n+=t.weaponCategory+" melee weapon ("+t.baseItem+")":t.weaponCategory?n+=t.weaponCategory+" melee weapon":t.baseItem&&(n+="melee weapon("+t.baseItem+")");break;case"R":t.weaponCategory&&t.baseItem?n+=t.weaponCategory+" ranged weapon ("+t.baseItem+")":t.weaponCategory?n+=t.weaponCategory+" ranged weapon":t.baseItem&&(n+="ranged weapon ("+t.baseItem+")");break;case"HA":case"MA":case"LA":n+=t.baseItem?p[t.type]+" ("+t.baseItem+")":p[t.type];break;default:n+=p[t.type]}return n.charAt(0).toUpperCase()+n.slice(1)}getItemRarity(t){let n="";return t.rarity&&"none"!==t.rarity&&(n+=t.rarity),t.reqAttune&&(n+=1==t.reqAttune?" (requires attunement)":" (requires attunement "+t.reqAttune+")"),n}ngOnInit(){}}return r.\u0275fac=function(t){return new(t||r)},r.\u0275cmp=e.Xpm({type:r,selectors:[["app-item"]],inputs:{item:"item"},decls:1,vars:1,consts:[[4,"ngIf"],[1,"pt-2","pb-4"],[1,"card"],[1,"card-body"],[1,"row"],[1,"col"],[3,"innerHtml"],[1,"row","border-bottom-primary"],[1,"pb-0","mb-2"],[1,"pb-0","mb-2","pull-right"],[1,"mt-2","feature-text","row"],[3,"list","parent"]],template:function(t,n){1&t&&e.YNc(0,x,31,22,"ng-container",0),2&t&&e.Q6J("ngIf",n.item)},directives:[s.O5,y.P],pipes:[s.i8,h.A,s.JJ],styles:[""]}),r})();var q=i(520);function C(r,a){if(1&r&&(e.TgZ(0,"td"),e._uU(1),e.ALo(2,"number"),e.qZA()),2&r){const t=e.oxw().$implicit;e.Tol("text--"+(t.value/100>=1?"gp":t.value/10>=1?"sp":"cp")),e.uIk("data-sort",t.value),e.xp6(1),e.AsE(" ",e.Dn7(2,5,t.value/100>=1?t.value/100:t.value/10>=1?t.value/10:t.value,"1.0","en-US")," ",t.value/100>=1?"gp":t.value/10>=1?"sp":"cp"," ")}}function k(r,a){1&r&&e._UZ(0,"td"),2&r&&e.uIk("data-sort",0)}function U(r,a){if(1&r){const t=e.EpF();e.TgZ(0,"tr",20),e.NdJ("click",function(){const l=e.CHM(t).$implicit;return e.oxw(2).setCurrItem(l)}),e.TgZ(1,"td",21),e.ALo(2,"sanitizeHtml"),e._uU(3),e.qZA(),e.TgZ(4,"td"),e._uU(5),e.ALo(6,"titlecase"),e.qZA(),e.TgZ(7,"td"),e._uU(8),e.qZA(),e.YNc(9,C,3,9,"td",22),e.YNc(10,k,1,1,"td",23),e.TgZ(11,"td"),e._uU(12),e.qZA(),e.TgZ(13,"td",18),e.ALo(14,"lowercase"),e._uU(15),e.qZA(),e.qZA()}if(2&r){const t=a.$implicit,n=e.oxw(2);e.ekj("table-active",(null==n.currItem?null:n.currItem.id)==t.id),e.xp6(1),e.Q6J("innerHtml",e.lcZ(2,13,t.name),e.oJD),e.xp6(2),e.Oqu(t.name),e.xp6(2),e.Oqu(e.lcZ(6,15,n.getItemType(t))),e.xp6(3),e.Oqu(t.reqAttune?"X":""),e.xp6(1),e.Q6J("ngIf",t.value),e.xp6(1),e.Q6J("ngIf",!t.value),e.xp6(1),e.uIk("data-sort",n.getRaritySort(t.rarity)),e.xp6(1),e.Oqu(t.rarity),e.xp6(1),e.Tol(e.lcZ(14,17,"text-right color-"+t.source)),e.xp6(2),e.Oqu(t.source)}}function J(r,a){if(1&r&&(e.TgZ(0,"div",5),e.TgZ(1,"table",6),e.TgZ(2,"thead"),e.TgZ(3,"tr"),e.TgZ(4,"th",7),e.TgZ(5,"div",8),e.TgZ(6,"div",9),e.TgZ(7,"span",10),e._UZ(8,"i",11),e.qZA(),e.qZA(),e._UZ(9,"input",12),e.qZA(),e.qZA(),e.TgZ(10,"th",7),e.TgZ(11,"div",8),e._UZ(12,"input",13),e.qZA(),e.qZA(),e.TgZ(13,"th",7),e.TgZ(14,"div",8),e._UZ(15,"input",14),e.qZA(),e.qZA(),e.TgZ(16,"th",7),e.TgZ(17,"div",8),e._UZ(18,"input",15),e.qZA(),e.qZA(),e.TgZ(19,"th",7),e.TgZ(20,"div",8),e._UZ(21,"input",16),e.qZA(),e.qZA(),e.TgZ(22,"th",7),e.TgZ(23,"div",8),e._UZ(24,"input",17),e.qZA(),e.qZA(),e.qZA(),e.TgZ(25,"tr"),e.TgZ(26,"th"),e._uU(27,"Name"),e.qZA(),e.TgZ(28,"th"),e._uU(29,"Type"),e.qZA(),e.TgZ(30,"th"),e._uU(31,"Attun."),e.qZA(),e.TgZ(32,"th"),e._uU(33,"Value"),e.qZA(),e.TgZ(34,"th"),e._uU(35,"Rarity"),e.qZA(),e.TgZ(36,"th",18),e._uU(37,"Source"),e.qZA(),e.qZA(),e.qZA(),e.TgZ(38,"tbody"),e.YNc(39,U,16,19,"tr",19),e.qZA(),e.qZA(),e.qZA()),2&r){const t=e.oxw();e.xp6(1),e.Q6J("dtOptions",t.dtOptions)("dtTrigger",t.dtTrigger),e.xp6(38),e.Q6J("ngForOf",t.shownItems)}}function Q(r,a){if(1&r&&e._UZ(0,"app-item",24),2&r){const t=e.oxw();e.Q6J("item",t.currItem)}}const c=function(r){return{active:r}};let f=(()=>{class r{constructor(t,n,o){this.http=t,this.route=n,this.location=o,this.dtTrigger=new _.xQ}getJSON(){return this.http.get("assets/data/items.json")}ngOnInit(){this.dtOptions={columnDefs:[{width:"60%",targets:0},{width:"20%",targets:1},{width:"20%",targets:2}],autoWidth:!1,scrollX:!0,dom:"trlp",orderMulti:!0,pagingType:"full_numbers",searching:!0,language:{lengthMenu:'Show <select><option value="10">10</option><option value="15">15</option><option value="20">30</option><option value="60">60</option><option value="-1">All</option></select> items',paginate:{first:"<<",last:">>",next:">",previous:"<"}},initComplete:function(t,n){this.api().columns().every(function(){const l=this,m=$(l.header()),O=m.parent().prev().children().get(m.index());$(":input",O).off("keyup change search").on("keyup change search",function(H){const T=$(this).val();l.search()!==T&&l.search(T).draw()}).trigger("change")})}},this.getJSON().subscribe(t=>{this.items=t,this.items.sort(function(n,o){return n.name<o.name?-1:1}),this.treasure=this.items.filter(n=>!!n.type&&n.type.includes("$")),this.normal=this.items.filter(n=>!!n.type&&!n.type.includes("$")&&n.rarity.includes("none")),this.magic=this.items.filter(n=>!n.type||!n.type.includes("$")&&!n.rarity.includes("none")),this.shownItems=this.items,this.selected="all",this.route.paramMap.subscribe(n=>{this.currItem=this.items.find(o=>o.id==this.route.snapshot.params.itemName)}),setTimeout(()=>{this.dtTrigger.next()})})}ngOnDestroy(){this.dtTrigger.unsubscribe()}setCurrItem(t){this.currItem=t,this.location.go("/items/"+this.currItem.id)}setItems(t){if(t!=this.selected){switch(t){case"magic":this.shownItems=this.magic;break;case"normal":this.shownItems=this.normal;break;case"treasure":this.shownItems=this.treasure;break;case"all":this.shownItems=this.items}this.dtElement.dtInstance.then(n=>{n.destroy(),this.dtTrigger.next()}),this.selected=t}}getValueSort(t){return t||1}getRaritySort(t){switch(t){case"none":return 0;case"common":return 1;case"uncommon":return 2;case"rare":return 3;case"very rare":return 4;case"legendary":return 5;case"artifact":return 6}return 0}getItemType(t){let n="";if(t.wondrous&&t.type)n+="Wondrous Item, ";else if(t.wondrous)return"Wondrous Item";switch(t.type){case"M":t.weaponCategory&&t.baseItem?n+=t.weaponCategory+" Melee Weapon ("+t.baseItem+")":t.weaponCategory?n+=t.weaponCategory+" Melee Weapon":t.baseItem&&(n+="Melee Weapon("+t.baseItem+")");break;case"R":t.weaponCategory&&t.baseItem?n+=t.weaponCategory+" Ranged Weapon ("+t.baseItem+")":t.weaponCategory?n+=t.weaponCategory+" Ranged Weapon":t.baseItem&&(n+="Ranged Weapon("+t.baseItem+")");break;default:n+=p[t.type]}return n}}return r.\u0275fac=function(t){return new(t||r)(e.Y36(q.eN),e.Y36(u.gz),e.Y36(s.Ye))},r.\u0275cmp=e.Xpm({type:r,selectors:[["app-items"]],viewQuery:function(t,n){if(1&t&&(e.Gf(Z,5),e.Gf(d.G,5)),2&t){let o;e.iGM(o=e.CRH())&&(n.child=o.first),e.iGM(o=e.CRH())&&(n.dtElement=o.first)}},decls:14,vars:14,consts:[[1,"table-type","p-3"],["role","button",1,"btn","btn-primary","p-2","m-1",3,"ngClass","click"],[1,"row"],["class","col items-table p-0",4,"ngIf"],[3,"item",4,"ngIf"],[1,"col","items-table","p-0"],["id","tbl-items","datatable","",1,"table","table-hover","table-condensed",3,"dtOptions","dtTrigger"],["colspan","1",1,"item-filter"],[1,"input-group","input-group-sm"],[1,"input-group-prepend"],[1,"input-group-text"],[1,"fa","fa-search"],["id","item-name-filter","type","search","placeholder","Filter Items",1,"form-control"],["id","item-prof-filter","type","search","placeholder","Type",1,"form-control"],["id","item-attune-filter","type","search","placeholder","Attunement",1,"form-control"],["id","item-value-filter","type","search","placeholder","Value",1,"form-control"],["id","item-rarity-filter","type","search","placeholder","Rarity",1,"form-control"],["id","item-source-filter","type","search","placeholder","Source",1,"form-control"],[1,"text-right"],[3,"table-active","click",4,"ngFor","ngForOf"],[3,"click"],[3,"innerHtml"],[3,"class",4,"ngIf"],[4,"ngIf"],[3,"item"]],template:function(t,n){1&t&&(e.TgZ(0,"h1"),e._uU(1,"D&D 5e Items"),e.qZA(),e.TgZ(2,"div",0),e.TgZ(3,"button",1),e.NdJ("click",function(){return n.setItems("all")}),e._uU(4,"All"),e.qZA(),e.TgZ(5,"button",1),e.NdJ("click",function(){return n.setItems("magic")}),e._uU(6,"Magic Items"),e.qZA(),e.TgZ(7,"button",1),e.NdJ("click",function(){return n.setItems("normal")}),e._uU(8,"Adventuring Supplies"),e.qZA(),e.TgZ(9,"button",1),e.NdJ("click",function(){return n.setItems("treasure")}),e._uU(10,"Treasure"),e.qZA(),e.qZA(),e.TgZ(11,"div",2),e.YNc(12,J,40,3,"div",3),e.qZA(),e.YNc(13,Q,1,1,"app-item",4)),2&t&&(e.xp6(3),e.Q6J("ngClass",e.VKq(6,c,"all"==n.selected)),e.xp6(2),e.Q6J("ngClass",e.VKq(8,c,"magic"==n.selected)),e.xp6(2),e.Q6J("ngClass",e.VKq(10,c,"normal"==n.selected)),e.xp6(2),e.Q6J("ngClass",e.VKq(12,c,"treasure"==n.selected)),e.xp6(3),e.Q6J("ngIf",n.shownItems),e.xp6(1),e.Q6J("ngIf",n.currItem))},directives:[s.mk,s.O5,d.G,s.sg,Z],pipes:[h.A,s.rS,s.JJ,s.i8],styles:[".item-filter[_ngcontent-%COMP%]{padding:0}.item-table[_ngcontent-%COMP%]{overflow:auto;padding-top:15px;padding-bottom:15px}"]}),r})();const N=[{path:"",component:f},{path:":itemName",component:f}];let S=(()=>{class r{}return r.\u0275fac=function(t){return new(t||r)},r.\u0275mod=e.oAB({type:r}),r.\u0275inj=e.cJS({imports:[[u.Bz.forChild(N)],u.Bz]}),r})(),M=(()=>{class r{}return r.\u0275fac=function(t){return new(t||r)},r.\u0275mod=e.oAB({type:r}),r.\u0275inj=e.cJS({imports:[[I.m,S]]}),r})()}}]);