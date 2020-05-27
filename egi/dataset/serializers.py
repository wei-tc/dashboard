import os

from rest_framework.serializers import ModelSerializer, ValidationError

from egi import settings
from .models import Dataset


class DatasetNameSerializer(ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['name']


class DatasetSerializer(ModelSerializer):
    class Meta:
        model = Dataset
        fields = ('name', 'description')
