from rest_framework import mixins
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import GenericViewSet

from common.util.helpers import get_object_or_404_if_staff_else_403
from .models import User
from .permissions import IsStaffOrRequestedUser
from .serializers import UserSerializer, UserUploadSerializer


class UserViewSet(mixins.RetrieveModelMixin,
                  mixins.UpdateModelMixin,
                  mixins.ListModelMixin,
                  GenericViewSet):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated, IsStaffOrRequestedUser]
    serializer_class = None

    lookup_field = 'username'

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UserUploadSerializer

        return UserSerializer

    def get_queryset(self):
        r_user = self.request.user

        if r_user.is_staff:
            return User.objects.all()

        return User.objects.filter(username=r_user.username)

    def get_object(self):
        filter = {self.lookup_field: self.kwargs[self.lookup_field]}
        obj = get_object_or_404_if_staff_else_403(User, self.request.user.is_staff, **filter)
        self.check_object_permissions(self.request, obj)
        return obj
