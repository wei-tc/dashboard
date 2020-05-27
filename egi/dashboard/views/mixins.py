from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import AccessMixin, LoginRequiredMixin
from django.contrib.auth.models import User
from django.db.models import Q
from django.http import Http404

# DO NOT use LoginRequiredMixin. Check whether the request.user is logged in first.
from user.models import User


class DatasetPermittedMixin(AccessMixin):
    """Verify that the current user has access to the dataset."""

    def dispatch(self, request, *args, **kwargs):
        user = request.user
        if not (user.is_authenticated or user.is_active):
            return self.handle_no_permission()

        requested_dataset = kwargs['name']
        dataset_or_plotting_dataset = Q(dataset__name=requested_dataset) | \
                                      Q(plot__dataset__name=requested_dataset)
        has_dataset_access = User.objects.filter(Q(user__username=request.user.username),
                                                 dataset_or_plotting_dataset).exists()

        if not (has_dataset_access or user.is_staff):
            return self.handle_no_permission()

        return super().dispatch(request, *args, **kwargs)


class PlotPermittedMixin(LoginRequiredMixin):
    """Verify that the current user has access to the requested user's dataset-plot pairs."""

    def dispatch(self, request, *args, **kwargs):
        user = request.user
        if not (user.is_authenticated or user.is_active):
            return self.handle_no_permission()

        # if user does not exist, DO NOT 404, otherwise attacker can get usernames
        requested_username = kwargs['username']
        requested_user = (requested_username == user.username)

        if not (requested_user or user.is_staff):
            return self.handle_no_permission()

        return super().dispatch(request, *args, **kwargs)


class StaffRequiredMixin(object):
    @classmethod
    def as_view(cls, *args, **kwargs):
        view = super(StaffRequiredMixin, cls).as_view(*args, **kwargs)
        return staff_member_required(view)
