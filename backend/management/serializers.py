from rest_framework import serializers
from .models import Patient, OperationType, DoctorProfile

class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = '__all__'

class OperationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OperationType
        fields = '__all__'

class PatientSerializer(serializers.ModelSerializer):
    operation = serializers.PrimaryKeyRelatedField(
        queryset=OperationType.objects.all(), 
        allow_null=True, 
        required=False
    )
    operation_name = serializers.ReadOnlyField(source='operation.name')
    computed_status = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_computed_status(self, obj):
        if obj.status == 'priority':
            return 'priority'
        if obj.status == 'confirmed':
            return 'confirmed'
        if obj.status == 'canceled':
            return 'canceled'
        if obj.status == 'completed':
            return 'completed'
        
        if obj.position > 0:
            return 'call' if obj.position <= 10 else 'waiting'
            
        return 'none'