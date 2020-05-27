#!/bin/sh

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py makesuper

exec gunicorn egi.wsgi:application -w 3 -b :8000
"$@"
