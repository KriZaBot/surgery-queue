import React, { useState, useEffect } from 'react';

const DoctorLogin = () => {
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false); // За да спречиме дупли кликови

    const handleLogin = async (inputPin) => {
        if (loading) return;
        setLoading(true);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/doctors/login-with-pin/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: inputPin })
            });
            
            if (res.ok) {
                localStorage.setItem('doctorToken', 'active');
                window.location.href = '/admin'; 
            } else {
                alert("ГРЕШЕН ПИН!");
                setPin('');
            }
        } catch (error) {
            alert("Нема врска со серверот.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (pin.length === 6) {
            handleLogin(pin);
        }
    }, [pin]);

    return (
        <div style={{
            height: '100vh', 
            width: '100vw', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: '#103a34', 
            margin: 0,
            padding: 0,
            overflow: 'hidden'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: 'white', marginBottom: '20px', fontFamily: 'sans-serif', fontWeight: 'bold' }}>
                    {loading ? 'ПРОВЕРКА...' : 'ВНЕСИ ПИН'}
                </h1>
                <input 
                    type="password" 
                    maxLength="6"
                    autoFocus
                    disabled={loading} 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    style={{
                        fontSize: '3rem',
                        textAlign: 'center',
                        letterSpacing: '10px',
                        padding: '10px',
                        borderRadius: '10px',
                        border: loading ? '3px solid #f39c12' : 'none',
                        width: '280px',
                        outline: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                    }}
                    placeholder="••••••"
                />
                <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '15px' }}>
                    Само за овластени лица
                </p>
            </div>
        </div>
    );
};

export default DoctorLogin;