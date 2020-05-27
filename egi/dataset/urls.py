from rest_framework.routers import DefaultRouter
from .views import DatasetViewSet

app_name = 'dataset'

router = DefaultRouter(trailing_slash=False)

router.register('', DatasetViewSet, 'dataset')

urlpatterns = router.urls