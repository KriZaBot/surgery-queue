FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["sh", "-c", "python manage.py makemigrations management && python manage.py migrate && python seed.py && python manage.py runserver 0.0.0.0:8000 --settings=hospital_project.settings"]