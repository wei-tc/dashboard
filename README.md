# EGI Dashboard
## Features
- Create, delete and allocate to clients plotly.js plots (timeseries, bar, stacked bar, map, pie, scatter) with industry standards (e.g., for environmental geochemical standards)
- Manipulate plot input variables by searchable dropdown boxes (x, y, group by), including filtering by column and year (including range)
- Aggregate data by max, min, median, max and last (most recent data entry)
- Upload, store and delete datasets (including notification of mixed data type columns, and addition of year and year-month columns on upload)
- User account privileges (superuser, staff and client), each with their own view of the site
- Account security: account logging, lockout and notification; with argon2 password encryption
- ECS, RDS and S3 ready 

Tech used: plotly.js, react.js, django, pandas, docker, gunicorn, nginx

<br/><br/>
## Run
1. cd earthscience-toolbox/egi
2. python3 -m venv env
3. source env/bin/activate
4. pip install -r requirements.txt 
5. npm ci 
6. ./manage.py runserver --settings=egi.settings.development

## Log in Details
username: davidfaulkner  
password: earthscience
  
username: client  
password: earthscience

## Endpoints 
**api/datasets**  
\[{dataset-1}, ...]  
  
/datasets?name=\<name>  
\[{"name":"test","description":"test dataset"}]  
  
/datasets/\<name>  
csv for that dataset

/datasets/
post requests create new datasets in the database

/datasets/<id>
put request update database entry for dataset with pk=<id>
  
**api/industry-standards**  
\[{industry-standard-1}, ...]

industry-standards/\<name>  
{"name":"CEPA_FW","standard":"{'Ag':0.05,'As':0.05,'Ba':1.0,'B':1.0,'Cd':0.01,'Cr':0.05,'Co':0.001,'Cu':1.0,'K':5.0,'Pb':0.005,'Hg':0.0002,'Mn':0.5,'Ni':1.0,'Se':0.01,'Sn':0.5,'SO4':400.0,'Zn':5.0}"}  
  
**api/plots**  
/plots/\<name>  
\[  
&ensp;{  
&emsp;"name": "test_plot",  
&emsp;"dataset": "test",  
&emsp;"plot_type": "box",  
&emsp;"default_settings": "{\"is_this_json\":\"maybe\"}"  
&ensp;}  
]  
    
**api/permissions**  
/permissions/\<username>  
\[  
&ensp;{  
&emsp;"username": "davidfaulkner",  
&emsp;"is_staff": true,  
&emsp;"dataset": [],  
&emsp;"plot": []  
&ensp;},  
&ensp;{  
&emsp;"username": "client",  
&emsp;"is_staff": false,  
&emsp;"dataset": \[  
&emsp;&emsp;"test2"  
&emsp;&ensp;],  
&emsp;"plot": \[  
&emsp;&emsp;{  
&emsp;&emsp;&emsp;"name": "test_plot",  
&emsp;&emsp;&emsp;"dataset": "test",  
&emsp;&emsp;&emsp;"plot_type": "box",  
&emsp;&emsp;&emsp;"default_settings": "{\"is_this_json\":\"maybe\"}"  
&emsp;&emsp;}  
&emsp;&ensp;]  
&ensp;}  
]    
