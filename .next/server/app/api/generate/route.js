(()=>{var e={};e.id=435,e.ids=[435],e.modules={3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},11997:e=>{"use strict";e.exports=require("punycode")},16051:(e,t,r)=>{"use strict";r.d(t,{JU:()=>d,U1:()=>u,hF:()=>o});var s=r(23323);let a=new Map;function n(e){return{id:e.id,userId:e.user_id,title:e.title,cvText:e.cv_text??"",jobAdText:e.job_ad_text??"",analysis:e.analysis??void 0,documents:e.documents??void 0,createdAt:e.created_at,updatedAt:e.updated_at}}async function i(e,t){let r=await fetch(`${s.Mh}/rest/v1/${e}`,{...t,headers:{"Content-Type":"application/json",apikey:s.$D,Authorization:`Bearer ${s.$D}`,...t?.headers??{}},cache:"no-store"});if(!r.ok){let e=await r.text();throw Error(`Supabase request failed (${r.status}): ${e}`)}return 204===r.status?null:r.json()}async function o(e){return s.y6?(await i(`projects?select=id,user_id,title,cv_text,job_ad_text,analysis,documents,created_at,updated_at&user_id=eq.${encodeURIComponent(e)}&order=updated_at.desc`)).map(n):Array.from(a.values()).filter(t=>t.userId===e).sort((e,t)=>t.updatedAt.localeCompare(e.updatedAt))}async function u(e,t){if(!s.y6){let r=a.get(e);return r?.userId===t?r:void 0}let r=(await i(`projects?select=id,user_id,title,cv_text,job_ad_text,analysis,documents,created_at,updated_at&id=eq.${encodeURIComponent(e)}&user_id=eq.${encodeURIComponent(t)}&limit=1`))[0];return r?n(r):void 0}async function d(e){return s.y6?(await i("projects?on_conflict=id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id:e.id,user_id:e.userId,title:e.title,cv_text:e.cvText,job_ad_text:e.jobAdText,analysis:e.analysis??null,documents:e.documents??null,created_at:e.createdAt,updated_at:e.updatedAt})}),e):(a.set(e.id,e),e)}},17412:(e,t,r)=>{"use strict";r.d(t,{HW:()=>d,Le:()=>p,JR:()=>c});var s=r(39916),a=r(32190),n=r(23323),i=r(44999),o=r(744);async function u(){(0,n.VV)();let e=await (0,i.UL)();return(0,o.createServerClient)(n.Mh,n.Ql,{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:r,options:s})=>{e.set(t,r,s)})}catch{}}}})}async function d(){if(!n.$c)return null;let e=await u(),{data:{user:t}}=await e.auth.getUser();return t}async function c(){n.$c||(0,s.redirect)("/auth");let e=await d();return e||(0,s.redirect)("/auth"),e}async function p(){if(!n.$c)return{error:a.NextResponse.json({error:"Supabase Auth is not configured"},{status:503}),user:null};let e=await d();return e?{error:null,user:e}:{error:a.NextResponse.json({error:"Unauthorized"},{status:401}),user:null}}},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},23323:(e,t,r)=>{"use strict";r.d(t,{$D:()=>n,$c:()=>i,Mh:()=>s,Ql:()=>a,VV:()=>u,y6:()=>o});let s=process.env.NEXT_PUBLIC_SUPABASE_URL,a=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,n=process.env.SUPABASE_SERVICE_ROLE_KEY,i=!!(s&&a),o=!!(s&&n);function u(){if(!i)throw Error("Supabase Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")}},27910:e=>{"use strict";e.exports=require("stream")},28354:e=>{"use strict";e.exports=require("util")},29021:e=>{"use strict";e.exports=require("fs")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:e=>{"use strict";e.exports=require("path")},36892:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>h,routeModule:()=>m,serverHooks:()=>g,workAsyncStorage:()=>_,workUnitAsyncStorage:()=>y});var s={};r.r(s),r.d(s,{POST:()=>l});var a=r(96559),n=r(48088),i=r(37719),o=r(32190),u=r(68050),d=r(17412),c=r(16051),p=r(96590);async function l(e){try{let{error:t,user:r}=await (0,d.Le)();if(t)return t;let s=await e.json(),a=await (0,u.G)((0,p.f)(s.cvText),(0,p.f)(s.jobAdText),s.analysis),n=await (0,c.U1)(s.projectId,r.id);return n&&await (0,c.JU)({...n,documents:a,updatedAt:new Date().toISOString()}),o.NextResponse.json({documents:a})}catch(e){return o.NextResponse.json({error:e instanceof Error?e.message:"Generation failed"},{status:500})}}let m=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/generate/route",pathname:"/api/generate",filename:"route",bundlePath:"app/api/generate/route"},resolvedPagePath:"/Users/rix/Documents/Progremine/Agents/CV/estonian-job-agent/app/api/generate/route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:_,workUnitAsyncStorage:y,serverHooks:g}=m;function h(){return(0,i.patchFetch)({workAsyncStorage:_,workUnitAsyncStorage:y})}},37830:e=>{"use strict";e.exports=require("node:stream/web")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55591:e=>{"use strict";e.exports=require("https")},57075:e=>{"use strict";e.exports=require("node:stream")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},68050:(e,t,r)=>{"use strict";r.d(t,{C:()=>p,G:()=>l});var s=r(31630);function a(){let e=process.env.OPENAI_API_KEY;if(!e)throw Error("Missing OPENAI_API_KEY");return new s.Ay({apiKey:e})}let n=`You are an expert Estonian job application writing AI agent.

Your purpose is to generate high-quality, tailored Estonian application documents from two inputs:
1. Candidate CV
2. Job advertisement

Your outputs must always be written in Estonian.

You must:
- analyze the CV carefully
- analyze the job advertisement carefully
- compare both documents
- identify matching skills, strengths, transferable experience, keywords, and gaps
- produce professional, polished, role-specific written materials

You must never:
- invent facts
- add unsupported achievements
- create missing work history
- guess dates, degrees, certifications, or employer names
- write generic output that ignores the job ad

If important data is missing or unclear, mark it as:
"Vajab t\xe4psustamist"`,i=`Generate these sections in Estonian and return only valid JSON:
- analysis_summary_et
- cv_et
- motivation_letter_et
- statement_short_et
- statement_long_et

Requirements:
- CV must be ATS-friendly.
- Motivation letter must be 250-400 words.
- Short statement must be 50-80 words.
- Long statement must be 100-150 words.
- Never invent facts.
- Use Vajab t\xe4psustamist when needed.`;var o=r(10209);let u=o.Ik({target_role:o.Yj(),employer_name:o.Yj(),candidate_summary:o.Yj(),matched_skills:o.YO(o.Yj()),transferable_skills:o.YO(o.Yj()),keyword_targets:o.YO(o.Yj()),strengths:o.YO(o.Yj()),weak_points:o.YO(o.Yj()),missing_information:o.YO(o.Yj()),relevant_experience_areas:o.YO(o.Yj()),tone_guidance:o.Yj(),fit_score_band:o.k5(["low","medium","high"])}),d=o.Ik({analysis_summary_et:o.Yj(),cv_et:o.Yj(),motivation_letter_et:o.Yj(),statement_short_et:o.Yj(),statement_long_et:o.Yj()}),c=process.env.OPENAI_MODEL??"gpt-5";async function p(e,t){let r=a(),s=(await r.responses.create({model:c,input:[{role:"system",content:n},{role:"user",content:`Analyze the CV and job advertisement. Return only valid JSON matching the analysis schema. Extract the strongest matches, job-ad keywords, strengths, weak points, relevant experience areas, and missing information. All reasoning should be grounded in the CV.

CV:
${e}

JOB AD:
${t}`}],text:{format:{type:"json_schema",name:"analysis",schema:{type:"object",additionalProperties:!1,properties:{target_role:{type:"string"},employer_name:{type:"string"},candidate_summary:{type:"string"},matched_skills:{type:"array",items:{type:"string"}},transferable_skills:{type:"array",items:{type:"string"}},keyword_targets:{type:"array",items:{type:"string"}},strengths:{type:"array",items:{type:"string"}},weak_points:{type:"array",items:{type:"string"}},missing_information:{type:"array",items:{type:"string"}},relevant_experience_areas:{type:"array",items:{type:"string"}},tone_guidance:{type:"string"},fit_score_band:{type:"string",enum:["low","medium","high"]}},required:["target_role","employer_name","candidate_summary","matched_skills","transferable_skills","keyword_targets","strengths","weak_points","missing_information","relevant_experience_areas","tone_guidance","fit_score_band"]}}}})).output_text;return u.parse(JSON.parse(s))}async function l(e,t,r){let s=a(),o=(await s.responses.create({model:c,input:[{role:"system",content:n},{role:"user",content:`${i}

ANALYSIS:
${JSON.stringify(r,null,2)}

CV:
${e}

JOB AD:
${t}`}],text:{format:{type:"json_schema",name:"documents",schema:{type:"object",additionalProperties:!1,properties:{analysis_summary_et:{type:"string"},cv_et:{type:"string"},motivation_letter_et:{type:"string"},statement_short_et:{type:"string"},statement_long_et:{type:"string"}},required:["analysis_summary_et","cv_et","motivation_letter_et","statement_short_et","statement_long_et"]}}}})).output_text;return d.parse(JSON.parse(o))}},73024:e=>{"use strict";e.exports=require("node:fs")},73566:e=>{"use strict";e.exports=require("worker_threads")},74075:e=>{"use strict";e.exports=require("zlib")},78335:()=>{},79551:e=>{"use strict";e.exports=require("url")},81630:e=>{"use strict";e.exports=require("http")},96487:()=>{},96590:(e,t,r)=>{"use strict";function s(e){return e.replace(/\r/g,"").replace(/\n{3,}/g,"\n\n").trim()}r.d(t,{f:()=>s})}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[719,712,679,630],()=>r(36892));module.exports=s})();