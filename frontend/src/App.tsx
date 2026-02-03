import { useEffect, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './AdminPanel'; 
import PatientPublic from './PatientPublic'; 
import DoctorLogin from './DoctorLogin'; 

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isLogged = localStorage.getItem('doctorToken'); 
    return isLogged ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        const logoutUser = () => {
            const token = localStorage.getItem('doctorToken');
            if (token) {
                localStorage.removeItem('doctorToken');
                window.location.href = '/login';
            }
        };

        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(logoutUser, 600000);
        };

        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('scroll', resetTimer);

        resetTimer();

        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keydown', resetTimer);
            window.removeEventListener('click', resetTimer);
            window.removeEventListener('scroll', resetTimer);
            if (timeout) clearTimeout(timeout);
        };
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<PatientPublic />} />
                <Route path="/login" element={<DoctorLogin />} />
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <AdminPanel />
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;