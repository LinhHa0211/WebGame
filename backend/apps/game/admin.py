from django.contrib import admin
from .models import Category, OperatingSystem, Game, CategoryDetail, OperatingSystemDetail, Promotion, PromotionDetail, Image, Order

# Register your models here.
admin.site.register(Category)
admin.site.register(OperatingSystem)
admin.site.register(Game)
admin.site.register(CategoryDetail)
admin.site.register(OperatingSystemDetail)
admin.site.register(Promotion)
admin.site.register(PromotionDetail)
admin.site.register(Image)
admin.site.register(Order)