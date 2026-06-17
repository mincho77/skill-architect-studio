import React,{useState,useEffect} from 'react'
interface OutputFile{filename:string;path:string;size:number}
export function OutputPanel({flowId,jobId,skillId}:{flowId:string;jobId:string;skillId:string}){
 const [files,setFiles]=useState<OutputFile[]>([])
 const [loading,setLoading]=useState(false)
 useEffect(()=>{
  const loadFiles=async()=>{
   setLoading(true)
   try{
    const response=await fetch(`/api/outputs?flowId=${flowId}&jobId=${jobId}`)
    const data=await response.json()
    setFiles(data.files||[])
   }catch(err){console.error('Error:',err)}
   setLoading(false)
  }
  loadFiles()
 },[flowId,jobId])
 return(
  <div className='border rounded-lg p-4 bg-white'>
   <h3 className='font-bold mb-4'>Outputs ({files.length})</h3>
   {loading&&<p className='text-gray-500 text-sm'>Cargando...</p>}
   <div className='space-y-2'>
    {files.map((file)=>(<div key={file.filename} className='flex justify-between items-center p-2 border rounded hover:bg-gray-50'><span className='text-sm'>{file.filename}</span><span className='text-xs text-gray-500'>{(file.size/1024).toFixed(2)} KB</span></div>))}
   </div>
  </div>
 )
}
