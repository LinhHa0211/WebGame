import Image from "next/image";
import { CategoryType } from "./CategoryList";

interface CategoryProps{
    category: CategoryType
    onClick?: () => void
    className?: string
}

const CategoryListItem: React.FC<CategoryProps> = ({
    category,
    onClick,
    className,
}) => {
    return (
        <div
            onClick={onClick}
            className={`${className} w-[50px]`}
        >
            <Image src={category.image_url} alt="Category" width={20} height={20} />
            <span className="text-xs">{category.title}</span>
        </div>
    )
}

export default CategoryListItem;