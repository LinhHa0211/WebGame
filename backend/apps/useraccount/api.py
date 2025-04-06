from django.http import JsonResponse

from rest_framework.decorators import api_view, authentication_classes, permission_classes

from .models import User
from .serializers import UserDetailSerializer

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def user_detail(request, userId):
    user = User.objects.get(id = userId)
    serializer = UserDetailSerializer(user, many=False)
    return JsonResponse(serializer.data, safe=False)

from django.http import JsonResponse
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def user_login(request):
    # Get email, password, and role from request data
    email = request.data.get('email')
    password = request.data.get('password')
    expected_role = request.data.get('role')  # 'USER', 'PUBLISHER', or 'ADMIN'

    # Basic validation
    if not email or not password:
        return JsonResponse(
            {'non_field_errors': ['Email and password are required']},
            status=400
        )

    if expected_role not in ['USER', 'PUBLISHER', 'ADMIN']:
        return JsonResponse(
            {'non_field_errors': ['Invalid role specified']},
            status=400
        )

    # Authenticate user
    user = authenticate(request, email=email, password=password)
    
    if user is not None and user.role == expected_role:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'pk': str(user.id),
                'email': user.email,
            }
        }
        return JsonResponse(response_data, status=200)
    else:
        return JsonResponse(
            {'non_field_errors': ['Invalid email or password']},
            status=401
        )