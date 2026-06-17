#!/usr/bin/env python3
import sys,json,base64,io
def handler(inputs):
 try:
  import matplotlib;matplotlib.use('Agg')
  import matplotlib.pyplot as plt
 except:return{"error":"matplotlib not installed"}
 title=inputs.get("title","Chart")
 data=inputs.get("data",[1,2,3])
 labels=inputs.get("labels",["A","B","C"])
 fig,ax=plt.subplots(figsize=(8,6))
 colors=['#2D6DF6','#0033A0','#00AEC7','#E3E829']
 colors=(colors*(len(data)//len(colors)+1))[:len(data)]
 bars=ax.bar(labels,data,color=colors,alpha=0.8)
 ax.set_title(title,fontsize=16,fontweight='bold')
 ax.set_ylabel('Valor')
 ax.grid(axis='y',alpha=0.3)
 buf=io.BytesIO()
 plt.savefig(buf,format='png',dpi=100,bbox_inches='tight')
 buf.seek(0)
 plt.close(fig)
 png_data=buf.getvalue()
 encoded=base64.b64encode(png_data).decode('utf-8')
 return{"status":"success","filename":"chart.png","mime_type":"image/png","size":len(png_data),"data":encoded,"title":title}
if __name__=="__main__":
 try:inputs=json.loads(sys.stdin.read());outputs=handler(inputs);print(json.dumps(outputs));sys.exit(0)
 except Exception as e:print(json.dumps({"error":str(e)}));sys.exit(1)
