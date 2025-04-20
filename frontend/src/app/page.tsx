import Image from "next/image";

import GameList from "@/components/game/GameList";
import PromotionSlider from "@/components/slider/PromotionSlider";
import RecommendationSlider from "@/components/slider/RecommendationSlider";

export default function Home() {
  return (
    <main className="max-w-[1500px] mx-auto px-6">
      <PromotionSlider/>
      <RecommendationSlider/>
      <GameList/>
    </main>
  );
}
