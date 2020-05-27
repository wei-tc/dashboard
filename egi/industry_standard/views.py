from rest_framework import mixins
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import GenericViewSet

from .models import IndustryStandard
from .permissions import IsStaffOrReadOnly
from .serializers import IndustryStandardSerializer


class IndustryStandardViewSet(mixins.CreateModelMixin,
                              mixins.RetrieveModelMixin,
                              mixins.UpdateModelMixin,
                              mixins.ListModelMixin,
                              GenericViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated, IsStaffOrReadOnly]
    serializer_class = IndustryStandardSerializer

    lookup_field = 'name'

    queryset = IndustryStandard.objects.all()
