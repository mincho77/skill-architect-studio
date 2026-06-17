#!/usr/bin/env python3
import sys,json,subprocess,tempfile,os,time,traceback
from pathlib import Path
class SkillExecutionError(Exception):pass
class PythonRunner:
 def __init__(self,skill_path,timeout=300):
  self.skill_path=Path(skill_path)
  self.timeout=timeout
  self.handler_file=self.skill_path/"scripts"/"handler.py"
  if not self.handler_file.exists():raise SkillExecutionError(f"handler.py no encontrado")
 def _create_virtualenv(self):
  venv_dir=Path(tempfile.gettempdir())/f"skill_runner_{os.getpid()}"
  if not venv_dir.exists():subprocess.run([sys.executable,"-m","venv",str(venv_dir)],capture_output=True,timeout=30,check=True)
  return venv_dir
 def _install_dependencies(self,venv_dir,requirements_file=None):
  pip_path=venv_dir/"bin"/"pip"
  if requirements_file is None:requirements_file=self.skill_path/"requirements.txt"
  if requirements_file.exists():subprocess.run([str(pip_path),"install","-q","-r",str(requirements_file)],capture_output=True,timeout=120,check=True)
 def execute(self,inputs):
  start_time=time.time()
  result={"timestamp":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"duration_seconds":0,"status":"error","error":None,"outputs":{}}
  try:
   venv_dir=self._create_virtualenv()
   self._install_dependencies(venv_dir)
   inputs_json=json.dumps(inputs)
   python_path=venv_dir/"bin"/"python"
   process=subprocess.Popen([str(python_path),str(self.handler_file)],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,cwd=str(self.skill_path))
   try:stdout,stderr=process.communicate(input=inputs_json,timeout=self.timeout)
   except subprocess.TimeoutExpired:
    process.kill()
    result["status"]="timeout"
    result["error"]=f"Timeout: {self.timeout}s"
    return result
   if process.returncode==0:
    try:
     outputs=json.loads(stdout)
     result["status"]="success"
     result["outputs"]=outputs
    except:result["status"]="error";result["error"]="JSON parse error"
   else:result["status"]="error";result["error"]=stderr or stdout
  except Exception as e:result["status"]="error";result["error"]=str(e)
  finally:result["duration_seconds"]=round(time.time()-start_time,3)
  return result
if __name__=="__main__":
 import argparse
 parser=argparse.ArgumentParser()
 parser.add_argument("--skill-path",required=True)
 parser.add_argument("--inputs",default="{}")
 parser.add_argument("--timeout",type=int,default=300)
 args=parser.parse_args()
 inputs=json.loads(args.inputs)
 runner=PythonRunner(args.skill_path,timeout=args.timeout)
 result=runner.execute(inputs)
 print(json.dumps(result,indent=2))
