from rest_framework import mixins
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.viewsets import GenericViewSet

from .models import Plot
from .permissions import IsStaffOrIsSafeAndHasPlotPermissionOrIsPatch
from .serializers import PlotSerializer


class PlotViewSet(mixins.CreateModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.ListModelMixin,
                  GenericViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated, IsStaffOrIsSafeAndHasPlotPermissionOrIsPatch]
    serializer_class = None
    renderer_classes = [JSONRenderer]

    lookup_field = 'name'

    def get_serializer_class(self):
        return PlotSerializer

    def get_queryset(self):
        r_user = self.request.user

        if r_user.is_staff:
            return Plot.objects.all()

        return Plot.objects.filter(user__username=r_user.username)
