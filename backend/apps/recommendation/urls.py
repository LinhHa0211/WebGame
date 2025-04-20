from django.urls import path
from . import api

urlpatterns = [
    path('<uuid:userId>/<uuid:gameId>/', api.update_access_history, name='api_update_access_history'),
    path('<uuid:userId>/', api.get_recommendations, name='api_get_recommendations'),
]
