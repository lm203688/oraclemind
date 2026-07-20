f='/home/ubuntu/swarmlabs/api_server_v3.py'
c=open(f).read()
c=c.replace("loadExpHistory(''+e.","loadExpHistory(\\'+e.")
c=c.replace("+'')\"","+\\'')\"")
c=c.replace("toggleCompare(''+e.","toggleCompare(\\'+e.")
c=c.replace("forkExperiment(''+e.","forkExperiment(\\'+e.")
open(f,'w').write(c)
print('FIXED')
