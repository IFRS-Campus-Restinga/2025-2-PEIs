from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class RegistrationRequest(models.Model):
    PROFILE_CHOICES = [
        ("coordenador", "Coordenador"),
        ("pedagogo", "Pedagogo"),
        ("napne", "NAPNE"),
        ("professor", "Professor"),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    profile = models.CharField(max_length=50, choices=PROFILE_CHOICES)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_user = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    def __str__(self):
        return f"{self.name} - {self.profile}"
