from rest_framework import permissions
from rest_framework.permissions import BasePermission


class IsStaffOrIsSafeAndHasPlotPermissionOrIsPatch(BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS or request.method == 'PATCH':
            return True

        if request.method == 'DELETE':
            return False

        return request.user.is_staff

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or request.user.plot.filter(name=obj.name).exists()
