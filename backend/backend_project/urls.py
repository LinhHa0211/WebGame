from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/game/', include('apps.game.urls')),
    path('api/auth/', include('apps.useraccount.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/recommendation/', include('apps.recommendation.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
