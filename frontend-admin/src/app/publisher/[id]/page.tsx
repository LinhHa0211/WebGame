import Image from "next/image";
import ContactButton from "@/components/button/ContactButton";
import GameList from "@/components/game/GameList";
import apiService from "@/services/apiService";
import { getUserId } from "@/lib/actions";

const PublisherDetailPage = async ({ params }: {params: {id: string}}) => {
    const publisher_id = await params.id
    const publisher = await apiService.get(`/api/auth/${publisher_id}`)
    const userId = await getUserId()
    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <aside className="col-span-1 mb-4">
                    <div className="flex flex-col items-center p-6 rounded-xl border border-gray-300 shadow-xl">
                        <Image
                            src={publisher.avatar_url || '/defaultavatar.jpg'}
                            width={200}
                            height={200}
                            alt="Publisher Name"
                            className="rounded-full"
                        />
                        <h1 className="mt-6 text-2xl">{publisher.username}</h1>
                        {userId != publisher_id && (
                            <ContactButton/>
                        )}
                    </div>
                </aside>
                <div className="col-span-1 md:col-span-3 pl-0 md:pl-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GameList
                            publisher_id={publisher_id}
                        />
                    </div>
                </div>
            </div>
        </main>
    )
}
export default PublisherDetailPage;