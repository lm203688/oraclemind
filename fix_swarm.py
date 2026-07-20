import re, sys

f = '/home/ubuntu/swarmlabs/api_server_v3.py'
c = open(f).read()

# 修复onclick单引号嵌套
# 旧: onclick="loadExpHistory(''+e.experiment_id+'')"
# 新: onclick="loadExpHistory(\''+e.experiment_id+'\')"
old1 = "loadExpHistory(''+e.experiment_id+'')"
new1 = "loadExpHistory(\\\\'+e.experiment_id+\\\\')"
c = c.replace(old1, new1)

old2 = "toggleCompare(''+e.experiment_id+'')"
new2 = "toggleCompare(\\\\'+e.experiment_id+\\\\')"
c = c.replace(old2, new2)

old3 = "forkExperiment(''+e.experiment_id+'')"
new3 = "forkExperiment(\\\\'+e.experiment_id+\\\\')"
c = c.replace(old3, new3)

open(f, 'w').write(c)
print('FIXED')
