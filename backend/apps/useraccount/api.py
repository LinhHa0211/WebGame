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