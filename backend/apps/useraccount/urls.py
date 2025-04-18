from django.urls import path

from dj_rest_auth.jwt_auth import get_refresh_view
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import LoginView, LogoutView, UserDetailsView
from rest_framework_simplejwt.views import TokenVerifyView

from .import api

urlpatterns = [
    path('register/', api.user_register, name='api_user_register'),
    path('login/', api.user_login, name='api_user_login'),
    path('logout/', LogoutView.as_view(), name='rest_logout'),
    path('<uuid:userId>/', api.user_detail, name='api_user_detail'),
    path('users/', api.get_users, name='get_users'),
    path('users/<str:user_id>/delete/', api.delete_user, name='delete_user'),
    path('users/<uuid:userId>/update/', api.user_update, name='api_user_update'),
]
