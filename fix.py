import os
f = '/home/ubuntu/swarmlabs/api_server_v3.py'
c = open(f).read()
c = c.replace("loadExpHistory(''+e.experiment_id+'')", "loadExpHistory(\\'+e.experiment_id+\\')")
c = c.replace("toggleCompare(''+e.experiment_id+'')", "toggleCompare(\\'+e.experiment_id+\\')")
c = c.replace("forkExperiment(''+e.experiment_id+'')", "forkExperiment(\\'+e.experiment_id+\\')")
open(f, 'w').write(c)
print('OK')
