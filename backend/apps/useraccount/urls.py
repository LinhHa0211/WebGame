from django.urls import path

from dj_rest_auth.jwt_auth import get_refresh_view
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import LoginView, LogoutView, UserDetailsView
from rest_framework_simplejwt.views import TokenVerifyView

from .import api

urlpatterns = [
    path('register/', RegisterView.as_view(), name='rest_register'),
    path('login/', api.user_login, name='api_user_login'),
    path('logout/', LogoutView.as_view(), name='rest_logout'),
    path('<uuid:userId>/', api.user_detail, name='api_user_detail'),
]
