import ntpath
import os

import pandas as pd
from django.contrib import messages

from rest_framework.exceptions import PermissionDenied, NotFound


def get_object_or_404_if_staff_else_403(model, is_staff, **kwargs):
    try:
        obj = model.objects.get(**kwargs)
    except model.DoesNotExist:
        if is_staff:
            raise NotFound(f'No {model._meta.object_name} matches the given query.')
        else:
            raise PermissionDenied()

    return obj


def file_extension(filename):
    name, extension = os.path.splitext(filename)
    return extension





def path_leaf(path):
    head, tail = ntpath.split(path)
    return tail or ntpath.basename(head)


def remove_file(path):
    if os.path.isfile(path):
        os.remove(path)


def extension_to_csv(path):
    filename, extension = os.path.splitext(path)
    return f'{filename}.csv'
