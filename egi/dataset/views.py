from django.core.files.storage import default_storage
from django.db.models import Q
from django.http import HttpResponse, HttpResponseNotFound
from rest_framework import mixins
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import GenericViewSet

from common.util.helpers import get_object_or_404_if_staff_else_403
from .models import Dataset
from .permissions import IsStaffOrHasDatasetPermission
from .serializers import DatasetSerializer


class DatasetViewSet(mixins.CreateModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.UpdateModelMixin,
                     mixins.ListModelMixin,
                     GenericViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated, IsStaffOrHasDatasetPermission]
    serializer_class = DatasetSerializer

    lookup_field = 'name'

    def get_queryset(self):
        r_user = self.request.user
        dataset_name = self.request.query_params.get('name')
        username = r_user.username
        if dataset_name:
            if r_user.is_staff:
                return Dataset.objects.filter(name=dataset_name)

            return (
                Dataset.objects.filter(Q(plots__user__username=username) | Q(user__username=username))
                    .filter(name=dataset_name)
                    .distinct()
                    .order_by('-name')
            )

        if r_user.is_staff:
            return Dataset.objects.all()

        return Dataset.objects.filter(Q(plots__user__username=username) |
                                      Q(user__username=username)).distinct().order_by('-name')

    def get_object(self):
        filter = {self.lookup_field: self.kwargs[self.lookup_field]}
        obj = get_object_or_404_if_staff_else_403(Dataset, self.request.user.is_staff, **filter)
        self.check_object_permissions(self.request, obj)
        return obj

    def retrieve(self, request, *args, **kwargs):
        dataset = self.get_object()

        if not default_storage.exists(dataset.file.name):
            return HttpResponseNotFound('Dataset does not exist')

        file = default_storage.open(dataset.file.name, mode='r')
        contents = file.read()
        file.close()
        return HttpResponse(contents, content_type='text/plain')
