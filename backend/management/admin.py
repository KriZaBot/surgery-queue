from django.contrib import admin
from .models import DoctorProfile, OperationType, Patient

# admin.py
class PatientAdmin(admin.ModelAdmin):
    
    list_display = ('first_name', 'last_name', 'access_code', 'status', 'position')
    
  
    readonly_fields = ('access_code',)
    
    list_filter = ('status', 'operation')
    search_fields = ('first_name', 'last_name', 'embg', 'access_code')




class DoctorProfileAdmin(admin.ModelAdmin):
    
    list_display = ('user', 'phone', 'pin', 'is_active')
    search_fields = ('user__username', 'phone', 'pin')

admin.site.register(Patient, PatientAdmin)
admin.site.register(OperationType)

admin.site.register(DoctorProfile, DoctorProfileAdmin)