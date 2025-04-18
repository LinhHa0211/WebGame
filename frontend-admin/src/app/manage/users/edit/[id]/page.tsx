import apiService from '@/services/apiService';
import EditUserForm from '@/components/form/EditUser';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

interface UserResponse {
  data: User;
}

interface EditUserPageProps {
  params: { id: string };
}

const EditUserPage = async ({ params }: EditUserPageProps) => {
  try {
    const response = await apiService.get(`/api/auth/${params.id}/`);
    if (!response || response.error) {
      throw new Error(response?.error || 'Failed to fetch user');
    }
    const userResponse: UserResponse = response;
    const user: User = userResponse.data || response; // Fallback to response if data is not present

    if (!user.id) {
      throw new Error('User data is invalid');
    }

    return <EditUserForm user={user} />;
  } catch (err: any) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">{err.message || 'Failed to fetch user details'}</p>
      </div>
    );
  }
};

export default EditUserPage;