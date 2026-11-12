/**
 * Chalk & Roots Standards Generator Plus — Cloudflare Worker
 * Required secret: OPENAI_API_KEY
 * Optional vars: OPENAI_MODEL, ALLOWED_ORIGIN
 */
const SYSTEM = `You are the instructional design assistant for Chalk & Roots.
Create rigorous, practical, classroom-ready K–12 lessons. The teacher supplies the exact standard wording. Preserve its code and wording exactly. Never invent a standard, code, official citation, or alignment claim. If wording is incomplete or unclear, flag that for teacher verification while still producing a useful draft.
Return ONLY valid JSON with exactly three string properties: title, teacher, student.
TEACHER must be a complete teacher-facing lesson plan with: standard and unpacking; measurable learning targets and success criteria; materials and preparation; explicit modeling/think-aloud; guided and collaborative practice; independent practice; timed lesson sequence matching the requested duration; checks for understanding; assessment and exit ticket; answer key/exemplar responses; selected differentiation and ELD supports; teacher reflection and next steps; a brief verification note. For multi-day sequences, give a coherent progression with daily focus and deliverables.
STUDENT must be a separate, student-ready handout aligned to the same standard. Include a clear learning goal, concise directions, worked example(s) when useful, scaffolded practice, independent tasks, space/prompts for explaining thinking, and a student self-check. Do not include teacher-only answers in the student handout.
Make both formats specific to the standard, grade/course, subject, focus, duration, context, and selected supports. Use accessible, polished language. Do not fabricate source texts or data; provide original examples or clearly label teacher-provided materials. Teacher verifies all content before instruction.`;
function cors(origin, allowed) {
 const ok=!allowed||allowed==="*"||origin===allowed;
 return {"Access-Control-Allow-Origin":ok?(allowed==="*"?"*":(origin||allowed||"*")):"null","Access-Control-Allow-Methods":"GET, POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, X-Admin-Token","Vary":"Origin"};
}
export default { async fetch(request,env) {
 const origin=request.headers.get("Origin")||"",allowed=env.ALLOWED_ORIGIN||"",headers=cors(origin,allowed);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(allowed&&origin!==allowed)return Response.json({error:"Origin not allowed."},{status:403,headers});

 const url=new URL(request.url);
 // Persistent standards library: Cloudflare D1 binding is named DB.
 if(url.pathname==="/api/standards" && request.method==="GET"){
  if(!env.DB)return Response.json({error:"Standards database is not connected yet. Bind a Cloudflare D1 database as DB."},{status:503,headers});
  const q=(url.searchParams.get("q")||"").trim().slice(0,160);
  const grade=Number(url.searchParams.get("grade")||0),subject=(url.searchParams.get("subject")||"").trim().slice(0,40);
  const framework=(url.searchParams.get("framework")||"").trim().slice(0,60);
  const limit=Math.min(100,Math.max(1,Number(url.searchParams.get("limit")||50)));
  let sql="SELECT id,framework,jurisdiction,subject,grade,grade_band,strand,code,title,wording,summary,keywords,official_url,source_name,source_checked_at,curated FROM standards WHERE 1=1";
  const args=[];
  if(grade){if(grade>=6&&grade<=8){sql+=" AND (grade=? OR grade_band=?)";args.push(grade,"6-8");}else{sql+=" AND grade=?";args.push(grade);}}
  if(subject){sql+=" AND subject=?";args.push(subject);}
  if(framework){sql+=" AND framework=?";args.push(framework);}
  if(q){sql+=" AND (code LIKE ? OR title LIKE ? OR wording LIKE ? OR summary LIKE ? OR keywords LIKE ? OR strand LIKE ?)";for(let i=0;i<6;i++)args.push("%"+q+"%");}
  sql+=" ORDER BY grade, strand, code LIMIT ?";
  args.push(limit);
  try{const result=await env.DB.prepare(sql).bind(...args).all();return Response.json({count:result.results.length,standards:result.results},{headers});}
  catch{return Response.json({error:"Could not read the standards library. Check that schema.sql has been applied to D1."},{status:500,headers});}
 }
 if(url.pathname==="/api/standards" && request.method==="POST"){
  if(!env.DB)return Response.json({error:"Standards database is not connected."},{status:503,headers});
  if(!env.DB_ADMIN_TOKEN||request.headers.get("X-Admin-Token")!==env.DB_ADMIN_TOKEN)return Response.json({error:"Admin authorization required."},{status:401,headers});
  let body;try{body=await request.json();}catch{return Response.json({error:"Send valid JSON."},{status:400,headers});}
  const items=Array.isArray(body.standards)?body.standards:[body];
  if(!items.length||items.length>500)return Response.json({error:"Import between 1 and 500 standards at a time."},{status:400,headers});
  const stmt=env.DB.prepare("INSERT INTO standards (id,framework,jurisdiction,subject,grade,grade_band,strand,code,title,wording,summary,keywords,official_url,source_name,source_checked_at,curated,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(framework,jurisdiction,code) DO UPDATE SET grade_band=excluded.grade_band,strand=excluded.strand,title=excluded.title,wording=excluded.wording,summary=excluded.summary,keywords=excluded.keywords,official_url=excluded.official_url,source_name=excluded.source_name,source_checked_at=excluded.source_checked_at,updated_at=CURRENT_TIMESTAMP");
  const batch=[];
  for(const s of items){
   const grade=Number(s.grade),code=String(s.code||"").trim().toUpperCase(),framework=String(s.framework||"CCSS").trim(),jurisdiction=String(s.jurisdiction||"National").trim(),subject=String(s.subject||"ELA").trim();
   const urlValue=String(s.official_url||"").trim();
   if(!code||!Number.isInteger(grade)||grade<0||grade>12||!s.strand||!s.title||!s.wording||!/^https:\/\//i.test(urlValue))return Response.json({error:"Each record needs grade (0–12), code, strand, title, exact wording, and an HTTPS official source URL."},{status:400,headers});
   const id=String(s.id||[framework,jurisdiction,code].join("-").toLowerCase().replace(/[^a-z0-9-]/g,"-")).slice(0,120);
   batch.push(stmt.bind(id,framework,jurisdiction,subject,grade,String(s.grade_band||"").slice(0,20),String(s.strand).slice(0,160),code,String(s.title).slice(0,240),String(s.wording).slice(0,8000),String(s.summary||"").slice(0,1200),String(s.keywords||"").slice(0,1000),urlValue,String(s.source_name||"Teacher-supplied source").slice(0,240),String(s.source_checked_at||new Date().toISOString().slice(0,10)).slice(0,20),s.curated?1:0));
  }
  try{const result=await env.DB.batch(batch);return Response.json({saved:items.length,results:result.length},{status:201,headers});}
  catch{return Response.json({error:"Import failed. Check for duplicate identifiers or invalid field values."},{status:500,headers});}
 }
 if(request.method!=="POST")return Response.json({error:"Use POST to generate a lesson."},{status:405,headers});
 if(!env.OPENAI_API_KEY)return Response.json({error:"Generator setup is incomplete. The API key is not configured."},{status:503,headers});
 let body;try{body=await request.json();}catch{return Response.json({error:"Please submit valid form details."},{status:400,headers});}
 const standard=String(body.standard||"").trim().slice(0,8000),grade=String(body.grade||"").trim().slice(0,120),subject=String(body.subject||"").trim().slice(0,120);
 const framework=String(body.framework||"").trim().slice(0,160),code=String(body.code||"").trim().slice(0,120),duration=String(body.duration||"One class period (45–60 minutes)").slice(0,120);
 const scope=String(body.scope||"").trim().slice(0,120),focus=String(body.focus||"").trim().slice(0,500),materials=String(body.materials||"").trim().slice(0,3000);
 const supports=body.supports&&typeof body.supports==="object"?body.supports:{};
 if(!standard||!grade||!subject)return Response.json({error:"Standard, grade/course, and subject are required."},{status:400,headers});
 const input=`Create both requested formats using these teacher inputs:
GRADE/COURSE: ${grade}
SUBJECT: ${subject}
FRAMEWORK: ${framework||"Not specified"}
STANDARD CODE: ${code||"Use only if present in supplied wording"}
EXACT STANDARD WORDING (source of truth): ${standard}
LESSON DURATION: ${duration}
SEQUENCE: ${scope||"One lesson"}
FOCUS: ${focus||"Address the supplied standard at an appropriate scale"}
MATERIALS / CLASSROOM CONTEXT: ${materials||"Not provided"}
MULTILINGUAL LEARNER / ELD SUPPORT: ${supports.eld?"Include":"Not specifically selected"}
SCAFFOLD / RETEACHING SUPPORT: ${supports.scaffold?"Include":"Use sound core scaffolding"}
EXTENSION: ${supports.extend?"Include":"Include a concise extension option"}
Return valid JSON only.`;
 try{
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:env.OPENAI_MODEL||"gpt-6.1-sol",instructions:SYSTEM,input,text:{format:{type:"json_object"}},max_output_tokens:9000})});
  const data=await response.json();
  if(!response.ok)return Response.json({error:"The lesson service could not complete the request. Check the Cloudflare model/API configuration and try again."},{status:502,headers});
  const raw=(data.output||[]).flatMap(item=>item.content||[]).filter(part=>part.type==="output_text").map(part=>part.text).join("\n").trim();
  if(!raw)return Response.json({error:"The lesson service returned an empty response. Please try again."},{status:502,headers});
  let result;try{result=JSON.parse(raw);}catch{return Response.json({error:"The lesson service returned an unreadable format. Please try again."},{status:502,headers});}
  if(typeof result.title!=="string"||typeof result.teacher!=="string"||typeof result.student!=="string")return Response.json({error:"The lesson service returned incomplete teacher/student formats. Please try again."},{status:502,headers});
  return Response.json({title:result.title,teacher:result.teacher,student:result.student},{headers});
 }catch{return Response.json({error:"Connection problem. Please try again."},{status:502,headers});}
}};
