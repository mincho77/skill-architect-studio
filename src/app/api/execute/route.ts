import {NextRequest,NextResponse} from 'next/server'
import {spawn} from 'child_process'
const executions=new Map()
export async function POST(req:NextRequest){
 try{
  const body=await req.json()
  const {skillId,version,inputs,timeout=300}=body
  if(!skillId||!version)return NextResponse.json({error:'skillId y version son requeridos'},{status:400})
  const jobId=`job_${Date.now()}_${Math.random().toString(36).substr(2,9)}`
  const execution={jobId,status:'pending',timestamp:new Date().toISOString()}
  executions.set(jobId,execution)
  runSkillAsync(skillId,version,inputs,timeout,jobId)
  return NextResponse.json({jobId,status:'pending',message:'Ejecución iniciada'})
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Error'},{ status:500})}
}
export async function GET(req:NextRequest){
 const jobId=req.nextUrl.searchParams.get('jobId')
 if(!jobId)return NextResponse.json({error:'jobId requerido'},{status:400})
 const execution=executions.get(jobId)
 if(!execution)return NextResponse.json({error:'Job no encontrado'},{status:404})
 return NextResponse.json(execution)
}
async function runSkillAsync(skillId:string,version:string,inputs:any,timeout:number,jobId:string){
 const execution=executions.get(jobId)!
 execution.status='running'
 try{
  const skillPath=`${process.cwd()}/public/skill_db/skills/${skillId}/${version}`
  const result=await executePythonRunner(skillPath,inputs,timeout)
  execution.status=result.status
  execution.outputs=result.outputs
  execution.error=result.error
  execution.duration_seconds=result.duration_seconds
 }catch(error){execution.status='error';execution.error=error instanceof Error?error.message:'Error'}
}
function executePythonRunner(skillPath:string,inputs:any,timeout:number):Promise<any>{
 return new Promise((resolve)=>{
  const process=spawn('python3',['lib/python_runner.py','--skill-path',skillPath,'--inputs',JSON.stringify(inputs),'--timeout',timeout.toString()])
  let stdout=''
  const timeoutHandle=setTimeout(()=>{process.kill();resolve({jobId:'unknown',status:'timeout',error:`Timeout: ${timeout}s`,duration_seconds:timeout})},timeout*1000+5000)
  process.stdout.on('data',(data)=>{stdout+=data.toString()})
  process.on('close',()=>{clearTimeout(timeoutHandle);try{resolve(JSON.parse(stdout))}catch{resolve({jobId:'unknown',status:'error',error:'JSON error',duration_seconds:0})}})
 })
}
