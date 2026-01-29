import os, django, random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Hospital_project.settings')
django.setup()

from django.contrib.auth.models import User
from management.models import Patient, OperationType, DoctorProfile

def seed():
    op_names = ['Апендиктомија', 'Херниопластика', 'Холецистектомија']
    ops = [OperationType.objects.get_or_create(name=name)[0] for name in op_names]
    
    for i in range(1, 19):
        if i <= 3:
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

        st = 'confirmed' if i <= 2 else 'priority' if i <= 4 else 'canceled' if i <= 6 else None
        pos = -i if st else i
        
        Patient.objects.create(
            first_name='Пациент',
            last_name=str(i),
            phone=f'07011122{i}',
            embg=str(i).zfill(13),
            diagnosis='Генерирано при седирање.',
            operation=random.choice(ops),
            status=st,
            position=pos
        )
    print("SREDE_NO")

if __name__ == "__main__":
    seed()