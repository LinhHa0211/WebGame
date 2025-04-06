'use client'

import Modal from "./Modal";
import { useState } from "react";
import useLoginModal from "@/hooks/useLoginModal";
import CustomButton from "../form/CustomButton";
import { handleLogin } from "@/lib/actions";
import apiService from "@/services/apiService";

const LoginModal = () => {
    const loginModal = useLoginModal();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string[]>([]);

    const submitLogin = async () => {
        const formData = {
            email: email,
            password: password,
            role: 'ADMIN'  // Specify role for Manager project
        };
        try {
            const response = await apiService.postWithoutToken('/api/auth/login/', JSON.stringify(formData));
            
            if (response.access) {
                await handleLogin(response.user.pk, response.access, response.refresh);
                loginModal.close();
                window.location.reload();
            } else {
                setError(response.non_field_errors || ['An error occurred']);
            }
        } catch (err) {
            setError(['Failed to connect to the server. Please try again.']);
        }
    };

    const content = (
        <>
            <form 
                action="submitLogin" 
                className="space-y-4"
            >
                <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    type="email" 
                    className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" 
                    placeholder="Your e-mail address" 
                />
                <input 
                    onChange={(e) => setPassword(e.target.value)} 
                    type="password" 
                    className="w-full h-[54px] px-4 border border-gray-300 rounded-xl" 
                    placeholder="Your password" 
                />
                {error.length > 0 && error.map((errMsg, index) => (
                    <div 
                        key={`error_${index}`}
                        className="p-5 bg-webgame text-white rounded-xl opacity-80"
                    >
                        {errMsg}
                    </div>
                ))}
                <CustomButton
                    label="Submit"
                    className="bg-webgame hover:bg-webgame-dark"
                    onClick={submitLogin}
                />
            </form>
        </>
    );

    return (
        <Modal
            isOpen={loginModal.isOpen}
            close={loginModal.close}
            label="Login"
            content={content}
        />
    );
};

export default LoginModal;