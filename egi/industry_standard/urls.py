from rest_framework.routers import DefaultRouter

from .views import IndustryStandardViewSet

app_name = 'industry_standard'

router = DefaultRouter(trailing_slash=False)

router.register('', IndustryStandardViewSet, 'industry_standard')

urlpatterns = router.urls
