import Link from "next/link";
import Image from "next/image";

import MenuItem from "./MenuItem";
import UserNav from "./UserNav";
import AddGameButton from "./AddGameButton";
import SearchButton from "./SearchButton";
import { getUserId } from "@/lib/actions";

const Navbar = async () => {
    const userId = await getUserId();
    return (
        <div className="w-full fixed top-0 left-0 py-6 border-b bg-white z-10">
            <div className="max-w-[1500px] mx-auto px-6">
                <div className="flex justify-between items-center">
                    <Link href="/">
                        <Image src="/logo.png" alt="WebGame logo" width={180} height={38} />
                    </Link>
                    <div className="flex space-x-6">
                        <MenuItem/>
                    </div>
                    <div className="flex items-center space-x-6">
                        <SearchButton/>
                        <UserNav
                            userId={userId}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar