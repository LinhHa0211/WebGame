import { create } from "zustand";

interface AddGameModalStore{
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

const useAddGameModal = create<AddGameModalStore>((set) => ({
    isOpen: false,
    open: () => set({isOpen: true}),
    close: () => set({isOpen: false})
}));

export default useAddGameModal;