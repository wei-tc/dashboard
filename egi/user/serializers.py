from django.contrib.auth import get_user_model
from django.http import HttpResponseBadRequest
from rest_framework.relations import SlugRelatedField
from rest_framework.serializers import ModelSerializer

from plot.models import Plot
from plot.serializers import PlotSerializer


class UserSerializer(ModelSerializer):
    dataset = SlugRelatedField(many=True, read_only=True, slug_field='name')
    plot = PlotSerializer(many=True, read_only=True)

    class Meta:
        model = get_user_model()
        fields = ['username', 'is_staff', 'dataset', 'plot']
        read_only_fields = ['username', 'is_staff']


class UserUploadSerializer(ModelSerializer):
    plot = SlugRelatedField(many=True, read_only=False, slug_field='name', queryset=Plot.objects.all())

    class Meta:
        model = get_user_model()
        fields = ['plot']

    def update(self, instance, validated_data):
        # Override since DRF returns HTTP 200 even if PATCH fails
        if self.partial and not validated_data:
            return HttpResponseBadRequest

        return super(UserUploadSerializer, self).update(instance, validated_data)
