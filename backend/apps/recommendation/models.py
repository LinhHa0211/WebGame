import uuid

from django.db import models
from django.db.models import UniqueConstraint
from django.core.validators import MinValueValidator

from apps.game.models import Game
from apps.useraccount.models import User

# Create your models here.
class AccessGameHistory(models.Model):
    class Meta:
        constraints = [
            UniqueConstraint(fields=['game', 'user'], name='unique_game_user_history')
        ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='access_game_history')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='access_game_history')
    weight = models.FloatField(default=1.0, validators=[MinValueValidator(1)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.game.title}"