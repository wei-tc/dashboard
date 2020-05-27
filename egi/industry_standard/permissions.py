from rest_framework import permissions

from common.util.permissions import IsStaff


class IsStaffOrReadOnly(IsStaff):
    def has_object_permission_hook(self, request, view, obj):
        return True
