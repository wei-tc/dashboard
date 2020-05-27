from rest_framework import permissions

from common.util.permissions import IsStaff


class IsStaffOrHasDatasetPermission(IsStaff):
    def forbidden_permissions_hook(self, request, view):
        return request.method in ['POST', 'PUT', 'PATCH']

    def has_object_permission_hook(self, request, view, obj):
        has_dataset_permission = request.user.dataset.filter(name=obj.name).exists() or \
                                 request.user.plot.filter(dataset__name=obj.name).exists()

        return has_dataset_permission
