import os, django, random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_project.settings')
django.setup()

from django.contrib.auth.models import User
from management.models import Patient, OperationType, DoctorProfile

def seed():
    Patient.objects.all().delete()
    
    op_names = ['Апендиктомија', 'Херниопластика', 'Холецистектомија']
    ops = [OperationType.objects.get_or_create(name=name)[0] for name in op_names]
    
    for i in range(1, 4):
        username = f'doc{i}'
        my_pin = f'12345{i}' 
        
        if not User.objects.filter(username=username).exists():
            if i == 1:
                u = User.objects.create_superuser(username, f'doc{i}@test.com', my_pin)
            else:
                u = User.objects.create_user(username, f'doc{i}@test.com', my_pin)
            
            DoctorProfile.objects.create(
                user=u,
                phone=f'07224298{i}',
                pin=my_pin,
                is_active=True
            )

    for i in range(1, 19):
        Patient.objects.create(
            first_name='Пациент',
            last_name=str(i),
            phone=f'07011122{i}',
            embg=str(i).zfill(13),
            diagnosis='Генерирано при седирање.',
            operation=random.choice(ops),
            status=None,
            position=i
        )
    
    print("SREDE_NO")

if __name__ == "__main__":
    seed()