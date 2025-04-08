'use client'

import { ChangeEvent, useState } from "react"
import Image from "next/image"
import Modal from "./Modal"
import CustomButton from "../form/CustomButton"
import useAddGameModal from "@/hooks/useAddGameModal"
import Categories from "../addgame/Category"
import OperatingSystems from "../addgame/OperatingSystem"
import apiService from "@/services/apiService"
import { useRouter } from "next/navigation"

const AddGameModal = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErros] = useState<string[]>([]);
    const [dataTitle, setDataTitle] = useState('');
    const [dataDescription, setDataDescription] = useState('');
    const [dataPrice, setDataPrice] = useState('');
    const [dataPublishYear, setDataPublishYear] = useState('');
    const [dataCategory, setDataCategory] = useState<string[]>([]);
    const [dataOperatingSystem, setDataOperatingSystem] = useState<string[]>([]);
    const [dataImage, setDataImage] = useState<File | null>(null);

    const addGameModal = useAddGameModal();
    const router = useRouter();

    const setCategory = (category: string) => {
        setDataCategory((prevCategories) => {
            if (prevCategories.includes(category)) {
                // If the category is already selected, remove it
                return prevCategories.filter((cat) => cat !== category);
            } else {
                // If the category is not selected, add it
                return [...prevCategories, category];
            }
        });
    }

    const setOperatingSystem = (operatingSystem: string) => {
        setDataOperatingSystem((prevOperatingSystems) => {
            if (prevOperatingSystems.includes(operatingSystem)) {
                // If the Operating System is already selected, remove it
                return prevOperatingSystems.filter((cat) => cat !== operatingSystem);
            } else {
                // If the Operating System is not selected, add it
                return [...prevOperatingSystems, operatingSystem];
            }
        });
    }

    const setImage = (event: ChangeEvent<HTMLInputElement>) => {
        if(event.target.files && event.target.files.length > 0){
            const tmpImage = event.target.files[0];
            setDataImage(tmpImage);
        }
    }

    const submitForm = async () => {
        if (
            dataTitle &&
            dataDescription &&
            dataPrice &&
            dataPublishYear &&
            dataCategory &&
            dataOperatingSystem &&
            dataImage
        ) {
            const formData = new FormData();
            formData.append('title', dataTitle);
            formData.append('description', dataDescription);
            formData.append('price', dataPrice);
            formData.append('publish_year', dataPublishYear);
            formData.append('image', dataImage);
            formData.append('categories', JSON.stringify(dataCategory));
    
            const response = await apiService.post('/api/game/create/', formData);
    
            if (response.success) {
                const gameId = response.game_id;
                for (let categoryId of dataCategory){
                    const categoryResponse = await apiService.post(`/api/game/create/add_category/${gameId}/${categoryId}/`, {});
                    if (categoryResponse.success) {
                        console.log('Categories added successfully');
                        
                    } else {
                        console.log('Error adding categories');
                    }
                }
                for (let operatingSystemId of dataOperatingSystem){
                    const operatingSystemResponse = await apiService.post(`/api/game/create/add_operating_system/${gameId}/${operatingSystemId}/`, {});
                    if (operatingSystemResponse.success) {
                        console.log('Operating System added successfully');
                        
                    } else {
                        console.log('Error adding Operating System');
                    }
                }
                console.log('Success creating the game')
                router.push('/');
                addGameModal.close();
            } else {
                console.log('Error creating the game');
                const tmpErrors: string[] = Object.keys(response.errors).map(key => {
                    return `${key}: ${response.errors[key]}`; 
                });
                setErros(tmpErrors);
            }
        }
    };
    

    const content = (
        <>
            {currentStep == 1 ? (
                <>
                    <h2 className="mb-6 text-2xl">Game Information</h2>

                    <div className="pt-3 pb-6 space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label>Title</label>
                            <input 
                                type="text" 
                                value={dataTitle}
                                onChange={(e) => setDataTitle(e.target.value)}
                                className="w-full p-4 border border-gray-600 rounded-xl"
                                placeholder="Enter game title..."
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label>Description</label>
                            <textarea
                                value={dataDescription}
                                onChange={(e) => setDataDescription(e.target.value)}
                                className="w-full h-[200px] p-4 border border-gray-600 rounded-xl"
                                placeholder="Enter game description..."
                            ></textarea> 
                        </div>
                    </div>

                    <CustomButton
                        label="Next"
                        className="w-full bg-webgame hover:bg-webgame-dark"
                        onClick={() => setCurrentStep(2)}
                    />
                </>
            ) : currentStep == 2 ? (
                <>
                    <h2 className="mb-6 text-2xl">Add Details</h2>

                    <div className="pt-3 pb-6 space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label>Price</label>
                            <input 
                                type="number" 
                                value={dataPrice}
                                onChange={(e) => setDataPrice(e.target.value)}
                                className="w-full p-4 border border-gray-600 rounded-xl"
                                placeholder="Enter game price..."
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label>Publish Year</label>
                            <input 
                                type="date" 
                                value={dataPublishYear}
                                onChange={(e) => setDataPublishYear(e.target.value)}
                                className="w-full p-4 border border-gray-600 rounded-xl"
                                placeholder="Enter game price..."
                            />
                        </div>
                    </div>

                    <CustomButton
                        label="Previous"
                        className='w-full mb-2 bg-black hover:bg-gray-800'
                        onClick={() => setCurrentStep(1)}
                    />

                    <CustomButton
                        label="Next"
                        className="w-full bg-webgame hover:bg-webgame-dark"
                        onClick={() => setCurrentStep(3)}
                    />
                </>
            ) : currentStep == 3 ? (
                <>
                    <h2 className="mb-6 text-2xl">Choose Category</h2>
                    <Categories
                        dataCategory={dataCategory}
                        setCategory={(category) => setCategory(category)}
                    />
    
                    <CustomButton
                        label="Previous"
                        className="w-full mb-2 bg-black hover:bg-gray-800"
                        onClick={() => setCurrentStep(2)}
                    />

                    <CustomButton
                        label="Next"
                        className="w-full bg-webgame hover:bg-webgame-dark"
                        onClick={() => setCurrentStep(4)}
                    />
                </>
            ) : currentStep == 4 ? (
                <>
                    <h2 className="mb-6 text-2xl">Choose Operating System</h2>
                    <OperatingSystems
                        dataOperatingSystem={dataOperatingSystem}
                        setOperatingSystem={(operatingSystem) => setOperatingSystem(operatingSystem)}
                    />

                    <CustomButton
                        label="Previous"
                        className="w-full mb-2 bg-black hover:bg-gray-800"
                        onClick={() => setCurrentStep(3)}
                    />

                    <CustomButton
                        label="Next"
                        className="w-full bg-webgame hover:bg-webgame-dark"
                        onClick={() => setCurrentStep(5)}
                    />
                </>
            ) : (
                <>
                    <h2 className="mb-6 text-2xl">Add Main Image</h2>
                    <div className='pt-3 pb-6 space-y-4'>
                        <div className='py-4 px-6 bg-gray-600 text-white rounded-xl'>
                            <input
                                type="file"
                                accept='image/*'
                                onChange={setImage}
                            />
                        </div>

                        {dataImage && (
                            <div className='w-[200px] h-[150px] relative'>
                                <Image
                                    fill
                                    alt="Uploaded image"
                                    src={URL.createObjectURL(dataImage)}
                                    className='w-full h-full object-cover rounded-xl'
                                />
                            </div>
                        )}
                    </div>

                    {errors.length > 0 && (
                        <div className='p-5 mb-4 bg-webgame text-white rounded-xl opacity-80'>
                            {errors.map((error, index) => (
                                <div key={index}>{error}</div>
                            ))}
                        </div>
                    )}

                    <CustomButton
                        label='Previous'
                        className='w-full mb-2 bg-black hover:bg-gray-800'
                        onClick={() => setCurrentStep(4)}
                    />

                    <CustomButton
                        label='Submit'
                        className="w-full bg-webgame hover:bg-webgame-dark"
                        onClick={submitForm}
                    />
                </>
            )}
        </>
    )
    
    return (
        <>
            <Modal
                isOpen={addGameModal.isOpen}
                close={addGameModal.close}
                label="Add game"
                content={content}
            />
        </>
    )
}

export default AddGameModal;