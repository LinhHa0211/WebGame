import apiService from '@/services/apiService';
import EditGameForm from '@/components/form/EditGame';

interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  publish_year: string;
  approval: string;
}

interface GameResponse {
  data: Game;
  error?: string;
}

interface EditGamePageProps {
  params: { id: string };
}

const EditGamePage = async ({ params }: EditGamePageProps) => {
  try {
    const response: GameResponse = await apiService.get(`/api/game/${params.id}/`);
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to fetch game');
    }
    const game: Game = response.data;

    if (!game.id) {
      throw new Error('Game data is invalid');
    }

    return <EditGameForm game={game} />;
  } catch (err: any) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-red-600">{err.message || 'Failed to fetch game details'}</p>
      </div>
    );
  }
};

export default EditGamePage;