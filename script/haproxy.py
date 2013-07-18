import csv
import urllib2
import sys
import base64


req = urllib2.Request('http://10.0.0.149:8181/stats;csv;norefresh')
authheader =  "Basic %s" % base64.encodestring('test:test')[:-1]
req.add_header("Authorization", authheader)

lwp = urllib2.urlopen(req)
data = lwp.read(1024*1024)
data = data.lstrip('# ').strip()
data = [ l.strip(',') for l in data.splitlines() ]
csvreader = csv.DictReader(data)

stats=dict()

for statdict in csvreader:
    
    for key,val in statdict.items():
    	metricname = ' '.join([ statdict['svname'].lower(), statdict['pxname'].lower(), key ])
		try:
			stats[metricname] = int(val)
		except (TypeError, ValueError), e:
			pass

print stats[sys.argv[1]]
