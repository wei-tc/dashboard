import requests
import logging
from boto3.session import Session
from egi.settings.base import *

# dynamically retrieve EC2 private IP for whitelisting ALLOWED_HOSTS
EC2_PRIVATE_IP = None
try:
    EC2_PRIVATE_IP = requests.get(
        'http://169.254.169.254/latest/meta-data/local-ipv4',
        timeout=0.01).text
except requests.exceptions.RequestException:
    pass

if EC2_PRIVATE_IP:
    ALLOWED_HOSTS.append(EC2_PRIVATE_IP)

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ['RDS_DB_NAME'],
        'USER': os.environ['RDS_USERNAME'],
        'PASSWORD': os.environ['RDS_PASSWORD'],
        'HOST': os.environ['RDS_HOSTNAME'],
        'PORT': os.environ['RDS_PORT'],
    }
}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/
AWS_ACCESS_KEY_ID = os.environ['AWS_ACCESS_KEY_ID']
AWS_SECRET_ACCESS_KEY = os.environ['AWS_SECRET_ACCESS_KEY']

AWS_S3_REGION_NAME = os.environ['AWS_S3_REGION_NAME']
AWS_STORAGE_BUCKET_NAME = os.environ['AWS_STORAGE_BUCKET_NAME']
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
AWS_DEFAULT_ACL = None
AWS_S3_OBJECT_PARAMETERS = {
    'Expires': 'Thu, 31 Dec 2099 20:00:00 GMT',
    'CacheControl': 'max-age=94608000',
}

MEDIA_ROOT = 'media/production'
MEDIA_LOCATION = 'media/production'
MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{MEDIA_LOCATION}/'
DEFAULT_FILE_STORAGE = 'egi.storage_backends.MediaStorage'

# HTTPS - disabled for demo
# CSRF_COOKIE_SECURE = True
# SESSION_COOKIE_SECURE = True
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# LOCKOUT EMAIL
EMAIL_HOST_USER = os.environ['LOCKOUT_EMAIL']
EMAIL_HOST_PASSWORD = os.environ['LOCKOUT_PASSWORD']
EMAIL_ADMIN = os.environ['LOCKOUT_ADMIN']

boto3_session = Session(
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_S3_REGION_NAME
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'aws': {
            'format': u"%(asctime)s [%(levelname)-8s] %(message)s [%(pathname)s:%(lineno)d]",
            'datefmt': "%Y-%m-%d %H:%M:%S"
        }
    },
    'handlers': {
        'watchtower': {
            'level': 'DEBUG',
            'class': 'watchtower.CloudWatchLogHandler',
            'boto3_session': boto3_session,
            'log_group': 'wei-tc-demo-logs',
            'stream_name': 'dashboard-service',
            'formatter': 'aws',
        },
    },
    'loggers': {
        'watchtower-logger': {
            'level': 'DEBUG',
            'handlers': ['watchtower'],
            'propagate': False,
        },
    },
}

# LOCKOUT REVERSE-PROXY
AXES_META_PRECEDENCE_ORDER = [
   'HTTP_X_FORWARDED_FOR',
   'REMOTE_ADDR',
]