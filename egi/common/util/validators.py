import re
import json

from django.forms import forms
from django.core import exceptions


def clean_json(data, field):
    if not data:
        return data

    data = data.replace("'", '"')

    try:
        json.loads(data)
    except:
        raise forms.ValidationError(f'{field} must be in JSON format')

    return re.sub(r'\s+(?=([^"]*"[^"]*")*[^"]*$)', '', data)

def aggressive_clean_json(data, field):
    if not data:
        return data

    data = data.replace("'", '"')

    try:
        json.loads(data)
    except:
        raise forms.ValidationError(f'{field} must be in JSON format')

    return data.replace(' ', '')
