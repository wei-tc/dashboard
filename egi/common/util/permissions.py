from rest_framework import permissions
from rest_framework.permissions import BasePermission


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        if request.method == 'DELETE':
            return False

        if self.forbidden_permissions_hook(request, view):
            return False

        return request.user.is_staff

    def forbidden_permissions_hook(self, request, view):
        return False

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff or self.has_object_permission_hook(request, view, obj)

    def has_object_permission_hook(self, request, view, obj):
        return False
