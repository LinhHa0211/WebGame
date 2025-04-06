import Image from "next/image";
import GameList from "@/components/game/GameList";

const MyGamesPage = () => {
    return (
        <main className="max-w-[1500px] mx-auto px-6 pb-6">
            <h1 className="my-6 text-2xl">My Games</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GameList/>
            </div>
        </main>
    )
}
export default MyGamesPage;