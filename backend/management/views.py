from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction, models
from django.db.models import Q
from .models import Patient, OperationType, DoctorProfile
from .serializers import PatientSerializer, OperationTypeSerializer, DoctorProfileSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

    @action(detail=False, methods=['get'], url_path='counts')
    def get_counts(self, request):
        counts = {
            
            'call': Patient.objects.filter(status__isnull=True).count(),
            'waiting': Patient.objects.filter(status__in=['confirmed', 'priority']).count(),
            'trash': Patient.objects.filter(status='canceled').count()
        }
        return Response(counts)




    def get_queryset(self):
        queryset = Patient.objects.all().order_by('position')
        search_query = self.request.query_params.get('search', None)
        
        if search_query:
            if search_query[0].isdigit():
                return queryset.filter(Q(phone__icontains=search_query) | Q(embg__icontains=search_query))
            return queryset.filter(Q(first_name__icontains=search_query) | Q(last_name__icontains=search_query))
        
        tab = self.request.query_params.get('tab', None)
        
        if tab == 'call':
            return queryset.filter(position__gt=0, position__lte=10, status__isnull=True)
        
        if tab == 'waiting':
            return queryset.filter(
                Q(status__in=['confirmed', 'priority']) | 
                Q(position__gt=10, status__isnull=True)
            )
        
        if tab == 'trash':
            return queryset.filter(status='canceled')

        return queryset.exclude(status='completed')

    def perform_create(self, serializer):
        serializer.save(status=None)

    @action(detail=False, methods=['post'], url_path='public-check')
    def public_check(self, request):
        embg = request.data.get('embg')
        access_code = request.data.get('access_code')
        patient = Patient.objects.filter(embg=embg, access_code=access_code).first()
        if patient:
            return Response({
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "status": patient.status,
                "position": patient.position
            })
        return Response({"error": "Не е пронајден пациент"}, status=status.HTTP_404_NOT_FOUND)

     
    @action(detail=False, methods=['post'])
    def add_urgent(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            patient = serializer.save(status='priority', position=-1)
            return Response({
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "position": "ИТНО (Приоритет)",
                "access_code": patient.access_code
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        patient = self.get_object()
        old_status = patient.status
        old_pos = patient.position
        new_status = request.data.get('status', old_status)
        
        if new_status in ['confirmed', 'priority', 'canceled'] and old_pos > 0:
            Patient.objects.filter(position__gt=old_pos).update(position=models.F('position') - 1)
            request.data['position'] = -abs(old_pos)
            

        elif old_status is not None and new_status is None:
            request.data['position'] = abs(old_pos) if old_pos != 0 else 1
            request.data['status'] = None

        elif new_status == 'completed' and old_pos > 0:
            Patient.objects.filter(position__gt=old_pos).update(position=models.F('position') - 1)
            request.data['position'] = 0

        return super().update(request, *args, **kwargs)

class OperationTypeViewSet(viewsets.ModelViewSet):
    queryset = OperationType.objects.all()
    serializer_class = OperationTypeSerializer

   
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.save(status=None) # Ова го повикува perform_create
        
        headers = self.get_success_headers(serializer.data)
        return Response({
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "position": patient.position,
            "access_code": patient.access_code
        }, status=status.HTTP_201_CREATED, headers=headers)

  

class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer

    @action(detail=False, methods=['post'], url_path='login-with-pin')
    def login_with_pin(self, request):
        pin = request.data.get('pin')
        doctor = DoctorProfile.objects.filter(pin=pin, is_active=True).first()
        if doctor:
            return Response({"status": "success"}, status=status.HTTP_200_OK)
        return Response({"error": "Невалиден ПИН"}, status=status.HTTP_401_UNAUTHORIZED)