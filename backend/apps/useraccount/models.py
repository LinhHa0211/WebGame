import uuid

from django.conf import settings
from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models

from backend_project.choices import ROLE_CHOICES


class CustomUserManager(UserManager):
    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')
        return self.create_user(email, email, password, **extra_fields)


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    username = models.CharField(
        max_length=150,
        unique=True,
        default=''
    )
    avatar = models.ImageField(upload_to='uploads/avatars')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='USER')

    is_active = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = []

    def avatar_url(self):
        if self.avatar:
            return f'{settings.WEBSITE_URL}{self.avatar.url}'
        else:
            return ''
        
    def save(self, *args, **kwargs):
        self.username = self.email
        if self.password and not self.password.startswith('pbkdf2_sha256$'):
            self.set_password(self.password)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.email