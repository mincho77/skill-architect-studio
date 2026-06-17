#!/usr/bin/env python3
import sys,json
def handler(inputs):
 text=inputs.get("text","")
 count=inputs.get("count",1)
 result=(text+" ")*count
 return {"result":result.strip(),"length":len(result.strip())}
if __name__=="__main__":
 try:inputs=json.loads(sys.stdin.read());outputs=handler(inputs);print(json.dumps(outputs));sys.exit(0)
 except Exception as e:print(json.dumps({"error":str(e)}));sys.exit(1)
