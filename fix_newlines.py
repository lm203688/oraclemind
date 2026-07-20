#!/usr/bin/env python3
import re
f='/home/ubuntu/swarmlabs/api_server_v3.py'
c=open(f,'rb').read()
scripts = re.findall(rb'(<script[^>]*>)(.*?)(</script>)', c, re.DOTALL)
total = 0
for open_tag, body, close_tag in scripts:
    if b'loadHistory' not in body:
        continue
    fixed = body.replace(b'\n', b'\\n')
    total += body.count(b'\n') - fixed.count(b'\n')
    c = c.replace(open_tag+body+close_tag, open_tag+fixed+close_tag, 1)
open(f,'wb').write(c)
print(total)
