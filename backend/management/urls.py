from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, OperationTypeViewSet, DoctorProfileViewSet

router = DefaultRouter()

router.register(r'patients', PatientViewSet)
router.register(r'operation-types', OperationTypeViewSet)
router.register(r'doctors', DoctorProfileViewSet)

urlpatterns = [
 
    path('', include(router.urls)),
]