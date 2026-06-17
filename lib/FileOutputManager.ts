import path from 'path'
import fs from 'fs'
import {promises as fsPromises} from 'fs'
export class FileOutputManager{
 constructor(private basePath:string='/tmp/skill_outputs'){if(!fs.existsSync(this.basePath))fs.mkdirSync(this.basePath,{recursive:true})}
 async getOutputPath(flowId:string,jobId:string,skillId:string):Promise<string>{
  const date=new Date().toISOString().split('T')[0]
  const outputPath=path.join(this.basePath,'flows',flowId,jobId,skillId,date)
  await fsPromises.mkdir(outputPath,{recursive:true})
  return outputPath
 }
 async saveFile(flowId:string,jobId:string,skillId:string,filename:string,content:Buffer,mimeType:string){
  const outputPath=await this.getOutputPath(flowId,jobId,skillId)
  const fullPath=path.join(outputPath,filename)
  await fsPromises.writeFile(fullPath,content)
  return{id:Buffer.from(`${flowId}|${jobId}|${skillId}|${filename}`).toString('base64'),filename,mimeType,size:content.length}
 }
 async listOutputs(flowId:string,jobId:string):Promise<any[]>{
  const basePath=path.join(this.basePath,'flows',flowId,jobId)
  if(!fs.existsSync(basePath))return[]
  const files:any[]=[]
  const walk=async(dir:string)=>{
   const entries=await fsPromises.readdir(dir,{withFileTypes:true})
   for(const entry of entries){
    const fullPath=path.join(dir,entry.name)
    if(entry.isDirectory())await walk(fullPath)
    else{const stat=await fsPromises.stat(fullPath);files.push({filename:entry.name,path:fullPath,size:stat.size})}
   }
  }
  await walk(basePath)
  return files
 }
}
export const fileOutputManager=new FileOutputManager()
