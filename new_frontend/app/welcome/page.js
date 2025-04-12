'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const WelcomePage = () => {
    const [accessToken, setAccessToken] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            // Если нет токена — на логин
            router.push('/login');
        } else {
            setAccessToken(token);
        }
    }, [router]);

    return (
        <div>
            <h1>Добро пожаловать!</h1>
            <p>Ваш access token:</p>
            <code style={{ wordBreak: 'break-all' }}>{accessToken}</code>
        </div>
    );
};

export default WelcomePage;
