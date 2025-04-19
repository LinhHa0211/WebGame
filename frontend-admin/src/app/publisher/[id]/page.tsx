// pages/publisher/[id].tsx
import Image from "next/image";
import ContactButton from "@/components/button/ContactButton";
import PublisherGameList from "@/components/game/PublisherGameList";
import apiService from "@/services/apiService";
import { getUserId } from "@/lib/actions";

const PublisherDetailPage = async ({ params }: { params: { id: string } }) => {
  const publisher_id = await params.id;
  const publisher = await apiService.get(`/api/auth/${publisher_id}`);
  const userId = await getUserId();

  return (
    <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg rounded-2xl mb-12">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Publisher Profile</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Publisher Profile Section */}
        <aside className="col-span-1">
          <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="relative w-32 h-32 rounded-full overflow-hidden hover:scale-105 transition-transform duration-300">
              <Image
                src={publisher.avatar_url || '/defaultavatar.jpg'}
                alt={`${publisher.username}'s avatar`}
                fill
                className="object-cover"
                priority
              />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{publisher.username}</h1>
            {userId != publisher_id && (
              <div className="mt-4">
                <ContactButton/>
              </div>
            )}
          </div>
        </aside>

        {/* Published Games Section */}
        <div className="col-span-1 md:col-span-3">
          <PublisherGameList publisher_id={publisher_id} />
        </div>
      </div>
    </main>
  );
};

export default PublisherDetailPage;