import string
import random
from django.db import models, transaction
from datetime import date
from django.contrib.auth.models import User

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    pin = models.CharField(max_length=6, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=False)

    def __str__(self): 
        return f"{self.user.last_name} - {self.phone}"

class OperationType(models.Model):
    name = models.CharField(max_length=100)
    def __str__(self): return self.name

class Patient(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Waiting'),
        ('priority', 'Priority'),
        ('completed', 'Done'),
        ('canceled', 'Trash'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    embg = models.CharField(max_length=13, unique=True)
    access_code = models.CharField(max_length=10, unique=True, null=True, blank=True, editable=False)
    diagnosis = models.TextField()
    operation = models.ForeignKey(OperationType, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=None, null=True, blank=True)
    scheduled_data = models.DateField(default=date.today)
    created_at = models.DateTimeField(auto_now_add=True)
    position = models.IntegerField(default=0, db_index=True)

    class Meta:
        ordering = ['position']

    def generate_access_code(self):
        chars = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(random.choice(chars) for _ in range(6))
            if not Patient.objects.filter(access_code=code).exists():
                return code

    def save(self, *args, **kwargs):
        with transaction.atomic():
            if not self.access_code:
                self.access_code = self.generate_access_code()

            if not self.id and self.position == 0 and self.status != 'priority':
                last_p = Patient.objects.filter(position__gt=0).order_by("-position").first()
                self.position = (last_p.position + 1) if last_p else 1

            if self.position > 0:
                exists = Patient.objects.filter(position=self.position).exclude(id=self.id).exists()
                if exists:
                    Patient.objects.filter(position__gte=self.position).update(position=models.F('position') + 1)
            
            super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} [{self.access_code}]"