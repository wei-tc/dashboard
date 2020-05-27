from django.http import HttpResponseRedirect
from django.urls import reverse
from django.views.generic.base import View, TemplateView, RedirectView


class DashboardDispatchView(View):
    def dispatch(self, request, *args, **kwargs):
        user = request.user

        if user.is_staff:
            return TemplateView.as_view(template_name='dashboard/staff/management.html')(request, *args, **kwargs)
        elif user.is_authenticated:
            return TemplateView.as_view(template_name='dashboard/client/dashboard.html')(request, *args, **kwargs)
        else:  # malicious or accidental direct routing
            return HttpResponseRedirect(reverse('login'))


class CreateDispatchView(View):
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_staff:
            return TemplateView.as_view(template_name='dashboard/staff/create.html')(request, *args, **kwargs)
        else:  # malicious or accidental direct routing
            return HttpResponseRedirect(reverse('login'))
