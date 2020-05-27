from django.http import HttpResponseBadRequest
from rest_framework.relations import SlugRelatedField
from rest_framework.serializers import ModelSerializer

from dataset.models import Dataset
from plot.models import Plot


class PlotSerializer(ModelSerializer):
    dataset = SlugRelatedField(many=False, read_only=False, slug_field='name', queryset=Dataset.objects.all())

    class Meta:
        model = Plot
        fields = ['name', 'dataset', 'plot_type', 'default_settings']
