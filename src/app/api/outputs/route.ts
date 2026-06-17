import {NextRequest,NextResponse} from 'next/server'
import {fileOutputManager} from '@/lib/FileOutputManager'
export async function POST(req:NextRequest){
 try{
  const formData=await req.formData()
  const flowId=formData.get('flowId') as string
  const jobId=formData.get('jobId') as string
  const skillId=formData.get('skillId') as string
  const file=formData.get('file') as File
  if(!flowId||!jobId||!skillId||!file)return NextResponse.json({error:'Campos requeridos'},{status:400})
  const buffer=await file.arrayBuffer()
  const outputFile=await fileOutputManager.saveFile(flowId,jobId,skillId,file.name,Buffer.from(buffer),file.type||'application/octet-stream')
  return NextResponse.json(outputFile,{status:201})
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Error'},{status:500})}
}
export async function GET(req:NextRequest){
 try{
  const flowId=req.nextUrl.searchParams.get('flowId')
  const jobId=req.nextUrl.searchParams.get('jobId')
  if(!flowId||!jobId)return NextResponse.json({error:'flowId y jobId requeridos'},{status:400})
  const outputs=await fileOutputManager.listOutputs(flowId,jobId)
  return NextResponse.json({files:outputs,totalCount:outputs.length})
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Error'},{status:500})}
}
