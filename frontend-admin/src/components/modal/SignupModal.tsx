'use client'

import Modal from "./Modal";
import { useState } from "react";
import useSignupModal from "@/hooks/useSignupModal";
import CustomButton from "../form/CustomButton";
import apiService from "@/services/apiService";
import { handleLogin } from "@/lib/actions";

const SignupModal = () =>{
    //Variables
    const signupModal = useSignupModal();
    const [email, setEmail] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState<string[]>([]);

    //Submit functionality
    const submitSignup = async () => {
        const formData = {
            email: email,
            password1: password1,
            password2: password2
        }
        const response = await apiService.postWithoutToken('/api/auth/register/', JSON.stringify(formData));
        
        if(response.access){
            await handleLogin(response.user.pk, response.access, response.refresh)
            signupModal.close();
            window.location.reload()
        }else{
            const tmpErrors: string[] = Object.values(response).map((error:any) => {
                return error;
            })
            setError(tmpErrors);
        }
    }


    const content = (
        <>
            <form 
                action={submitSignup}
                className="space-y-4"
            >
                <input onChange={(e) => setEmail(e.target.value)} type="email" className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" placeholder="Your e-mail address" />
                <input onChange={(e) => setPassword1(e.target.value)} type="password" className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" placeholder="Your password" />
                <input onChange={(e) => setPassword2(e.target.value)} type="password" className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" placeholder="Repeat password" />
                
                {error.map((error, index) => {
                    return(
                        <div 
                            key={`error_${index}`}
                            className="p-5 bg-webgame text-white rounded-xl opacity-80"
                        >
                            {error}
                        </div>
                    )
                })}
                
                <CustomButton
                    label="Submit"
                    className="bg-webgame hover:bg-webgame-dark"
                    onClick={submitSignup}
                />
            </form>
        </>
    )
    return (
        <Modal
            isOpen={signupModal.isOpen}
            close={signupModal.close}
            label="Signup"
            content={content}
        />
    )
}

export default SignupModal;