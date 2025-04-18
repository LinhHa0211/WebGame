import uuid
from django.db import models
from django.db.models import UniqueConstraint
from django.conf import settings
from django.utils import timezone
from apps.useraccount.models import User
from backend_project.choices import GAME_APPROVAL_CHOICES, ORDER_STATUS_CHOICES
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

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
    approval_description = models.TextField(blank=True, default='')
    avg_rating = models.FloatField(default=0.0)
    
    def image_url(self):
        return f'{settings.WEBSITE_URL}{self.image.url}'
    
    def get_publish_year(self):
        return self.publish_year.year
    
    def get_purchase_count(self):
        return self.orders_user.filter(status='PAID').count()
    
    def update_avg_rating(self):
        ratings = self.ratings.all()
        if ratings.exists():
            avg = ratings.aggregate(models.Avg('rating'))['rating__avg']
            self.avg_rating = round(avg, 1)
        else:
            self.avg_rating = 0.0
        self.save()
    
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
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='orders_user')
    buy_at = models.DateTimeField(default=timezone.now)
    total_price = models.FloatField()
    status = models.CharField(max_length=10, choices=ORDER_STATUS_CHOICES, default='PAID')
    refund_description = models.TextField(blank=True, default='')
    
    def __str__(self):
        return f"Games {self.game.title} of: {self.user.username}"

class Rating(models.Model):
    class Meta:
        constraints = [
            UniqueConstraint(fields=['user', 'game'], name='unique_user_game_rating')
        ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Rating {self.rating} for {self.game.title} by {self.user.username}"

@receiver(post_save, sender=Rating)
def update_avg_rating_on_save(sender, instance, **kwargs):
    instance.game.update_avg_rating()

@receiver(post_delete, sender=Rating)
def update_avg_rating_on_delete(sender, instance, **kwargs):
    instance.game.update_avg_rating()