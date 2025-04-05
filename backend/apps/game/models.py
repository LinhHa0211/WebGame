import uuid

from django.db import models
from django.db.models import UniqueConstraint
from django.conf import settings
from django.utils import timezone
from apps.useraccount.models import User
from backend_project.choices import GAME_APPROVAL_CHOICES, ORDER_STATUS_CHOICES


# Create your models here.
class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    image = models.ImageField(upload_to='uploads/categories', null=True, blank=True)
    
    def image_url(self):
        return f'{settings.WEBSITE_URL}{self.image.url}'
    
    def __str__(self):
        return self.title
    
class OperatingSystem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.title
    
    
class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    price = models.FloatField()
    publisher = models.ForeignKey(User, related_name='games', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='uploads/games', null=True, blank=True)
    publish_year = models.DateField()
    approval = models.CharField(max_length=10, choices=GAME_APPROVAL_CHOICES, default='PENDING')
    # comment
    # ratings
    #favorited
    
    def image_url(self):
        return f'{settings.WEBSITE_URL}{self.image.url}'
    
    def get_publish_year(self):
        return self.publish_year.year
    
    def __str__(self):
        return self.title
    
    
class CategoryDetail(models.Model):
    class Meta:
        constraints = [
            UniqueConstraint(fields=['game', 'category'], name='unique_game_category')
        ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='category_details')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='category_details')
    
    def __str__(self):
        return self.game.title + '-' + self.category.title
    
class OperatingSystemDetail(models.Model):
    class Meta:
        constraints = [
            UniqueConstraint(fields=['game', 'operating_system'], name='unique_game_operating_system')
        ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='operatingsystem_details')
    operating_system = models.ForeignKey(OperatingSystem, on_delete=models.CASCADE, related_name='operatingsystem_details')
    
    def __str__(self):
        return self.game.title + '-' + self.operating_system.title
    
class Promotion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, unique=True)
    start_day = models.DateTimeField(auto_now_add=True)
    end_day = models.DateTimeField()
    
    def __str__(self):
        return self.title
    
class PromotionDetail(models.Model):
    class Meta:
        constraints = [
            UniqueConstraint(fields=['game', 'promotion'], name='unique_game_promotion')
        ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    discount = models.FloatField()
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='promotion_details')
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE, related_name='promotion_details')
    
    def __str__(self):
        return self.promotion.title + '-' + self.game.title
    
class Image(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    img = models.ImageField(upload_to='uploads/games', null=True, blank=True)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='images')
    
    def image_url(self):
        return f'{settings.WEBSITE_URL}{self.img.url}'
    
    def __str__(self):
        return str(self.id)
    
class Order(models.Model):
    class Meta:
        constraints = [
            UniqueConstraint(fields=['game', 'user'], name='unique_games_user')
        ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, related_name='orders_user', on_delete=models.CASCADE)
    game = models.ForeignKey(Game, related_name='orders_user', on_delete=models.CASCADE)
    buy_at = models.DateTimeField(default=timezone.now)
    total_price = models.FloatField()
    status = models.CharField(max_length=10, choices=ORDER_STATUS_CHOICES, default='PAID')
    
    def __str__(self):
        return f"Games {self.game.title} of: {self.user.username}"
    
