import os
import pandas as pd

from django.contrib import admin, messages
from django.contrib.admin import ModelAdmin
from django.contrib.auth.models import Group

from .models import ProxyPlot, ProxyDataset, ProxyIndustryStandard


@admin.register(ProxyPlot)
class PlotAdmin(ModelAdmin):
    fieldsets = [
        (None, {'fields': ['name', 'dataset', 'plot_type', 'default_settings']}),
    ]

    list_display = ('name', 'dataset', 'plot_type')

    search_fields = ['name', 'dataset', 'plot_type']


@admin.register(ProxyDataset)
class ProxyDatasetAdmin(ModelAdmin):
    fieldsets = [
        (None, {'fields': ['name', 'creation_date', 'description', 'file']}),
    ]

    list_display = ('name', 'description', 'creation_date', 'last_modified_date', 'upload_date')
    list_filter = ['creation_date', 'last_modified_date', 'upload_date']

    search_fields = ['name', 'description']

    def save_model(self, request, obj, form, change):
        filename, extension = os.path.splitext(obj.file.name)
        obj.file.name = os.path.join(f'{form.cleaned_data["name"]}{extension}')
        obj.save()

        obj.warn_if_dataset_issue(request)


@admin.register(ProxyIndustryStandard)
class ProxyIndustryStandardAdmin(ModelAdmin):
    list_display = ['name']


admin.site.site_title = 'EGI'
admin.site.site_header = 'Dashboard Administration'
admin.site.index_title = 'Administration'

admin.site.unregister(Group)
