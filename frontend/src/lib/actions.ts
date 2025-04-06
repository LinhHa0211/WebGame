'use server';

import { cookies } from "next/headers";

export async function handleLogin(userId: string, accessToken: string, refreshToken: string) {
    (await cookies()).set('user_session_userid', userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // One week
        path: '/'
    });
    (await cookies()).set('user_session_access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 60 minutes
        path: '/'
    });
    (await cookies()).set('user_session_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // One week
        path: '/'
    });
}

export async function resetAuthCookies() {
    (await cookies()).set('user_session_userid', '');
    (await cookies()).set('user_session_access_token', '');
    (await cookies()).set('user_session_refresh_token', '');
}

export async function getUserId() {
    const userId = (await cookies()).get('user_session_userid')?.value;
    return userId ? userId : null;
}

export async function getAccessToken() {
    const accessToken = (await cookies()).get('user_session_access_token')?.value;
    return accessToken ? accessToken : null;
}