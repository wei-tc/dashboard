from rest_framework.routers import DefaultRouter

from .views import UserViewSet

app_name = 'user'

router = DefaultRouter(trailing_slash=True)

router.register('', UserViewSet, 'permission')

urlpatterns = router.urls
