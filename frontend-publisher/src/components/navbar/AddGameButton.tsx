'use client'
import useAddGameModal from "@/hooks/useAddGameModal"
import useLoginModal from "@/hooks/useLoginModal";

interface AddGameButtonProps{
    userId?: string | null;
}

const AddGameButton: React.FC<AddGameButtonProps> = ({
    userId
}) => {
    const loginModal = useLoginModal();
    const addGameModal = useAddGameModal();
    const addGame = () => {
        if (userId){
            addGameModal.open()
        }else{
            loginModal.open()
        }
    }
    return (
        <div 
            onClick={addGame}
            className="p-2 cursor-pointer text-sm font-semibold rounded-full hover:bg-gray-200"
        >
            Add Game
        </div>
    )
}
export default AddGameButton