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
    try:
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
                    'username': user.username
                }
            }
            return JsonResponse(response_data, status=200)
        else:
            return JsonResponse(
                {'non_field_errors': ['Invalid email or password']},
                status=401
            )
    except Exception as e:
        # Catch any unexpected errors and return a JSON response
        return JsonResponse(
            {'non_field_errors': [f'Server error: {str(e)}']},
            status=500
        )
        
@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def user_register(request):
    try:
        # Get data from request
        email = request.data.get('email')
        username = request.data.get('userName')  # Matches the frontend field name
        password1 = request.data.get('password1')
        password2 = request.data.get('password2')

        # Log the request data for debugging
        print('Request Data:', request.data)

        # Basic validation
        if not email or not username or not password1 or not password2:
            return JsonResponse(
                {'non_field_errors': ['Email, username, and passwords are required']},
                status=400
            )

        if password1 != password2:
            return JsonResponse(
                {'non_field_errors': ['Passwords do not match']},
                status=400
            )

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return JsonResponse(
                {'non_field_errors': ['Email is already registered']},
                status=400
            )

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse(
                {'non_field_errors': ['Username is already taken']},
                status=400
            )

        # Create the user
        user = User.objects.create(
            email=email,
            username=username,
            role='USER'  # Default role for new users
        )
        user.set_password(password1)  # Hash the password
        user.save()

        # Log the created user for debugging
        print('Created User:', user.__dict__)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        response_data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'pk': str(user.id),
                'email': user.email,
                'username': user.username
            }
        }

        return JsonResponse(response_data, status=201)

    except Exception as e:
        print('Error during registration:', str(e))
        return JsonResponse(
            {'non_field_errors': [str(e)]},
            status=500
        )