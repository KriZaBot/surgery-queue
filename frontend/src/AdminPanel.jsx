import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { NameFields, EmbgModule, DiagnosisModule, PhoneInput, OperationInput, SearchInput } from './Components/PatientComponents';
import PatientTable from './Components/PatientTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './Components/Style/PatientsInput.css';
import './Components/Style/PatientsTable.css';

function App() {
    const [counts, setCounts] = useState({ call: 0, waiting: 0, trash: 0 });
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState('call');
    const [editingField, setEditingField] = useState({ id: null, field: null });
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', phone: '', diagnosis: '', operation: '', embg: ''
    });

    const nameRef = useRef();

    
    const handleLogout = () => {
        localStorage.removeItem('doctorToken');
        window.location.href = '/login';
    };

    const fetchCounts = () => {
        axios.get('http://127.0.0.1:8000/api/patients/counts/')
            .then(res => setCounts(res.data))
            .catch(err => console.error("Грешка со бројките:", err));
    };

    const fetchPatients = (search = "", tab = "call") => {
        let url = `http://127.0.0.1:8000/api/patients/`;
        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        } else {
            url += `?tab=${tab}`;
        }
        axios.get(url)
            .then(res => setPatients(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchPatients(searchTerm, activeTab);
            fetchCounts();
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm, activeTab]);

    const handleNextField = (e) => {
        if (!e || !e.target) return;
        const form = e.target.closest('form') || e.target.closest('.table-container');
        if (!form) return;
        const elements = Array.from(form.querySelectorAll('input, select, textarea, button, [tabIndex="0"]'));
        const currentIndex = elements.indexOf(e.target);
        if (elements[currentIndex + 1]) elements[currentIndex + 1].focus();
    };

    const handleLiveEdit = (pId, field, value) => {
        setPatients(prev => prev.map(p => p.id === pId ? { ...p, [field]: value } : p));
    };

    const saveField = (p) => {
        axios.put(`http://127.0.0.1:8000/api/patients/${p.id}/`, p)
            .then(() => {
                setEditingField({ id: null, field: null });
                setSearchTerm("")
                fetchPatients(searchTerm, activeTab);
                fetchCounts();
            })
            .catch(() => alert("Грешка при зачувување!"));
    };

    const handleSubmit = (isUrgent = false) => {
        const url = isUrgent 
            ? 'http://127.0.0.1:8000/api/patients/add_urgent/' 
            : 'http://127.0.0.1:8000/api/patients/';
        
        axios.post(url, formData).then(() => {
            fetchPatients(searchTerm, activeTab);
            fetchCounts();
            setFormData({ first_name: '', last_name: '', phone: '', diagnosis: '', operation: '', embg: '' });
            nameRef.current?.focusFirst();
        }).catch(err => {
            console.error("Грешка од серверот:", err.response.data);
            alert("Проблем со внесот: " + JSON.stringify(err.response.data));
        });
    };

   

    return (
        <div className="full-screen-wrapper">
            <aside className="sidebar-admin shadow">
                <h3 className="panel-title">Нов Пациент</h3>
                <form className="admin-form" onSubmit={(e) => e.preventDefault()}>
                    <NameFields 
                        ref={nameRef} 
                        firstName={formData.first_name} 
                        lastName={formData.last_name}
                        onFirstChange={(v) => setFormData({...formData, first_name: v})}
                        onLastChange={(v) => setFormData({...formData, last_name: v})}
                        onNext={handleNextField} 
                    />
                    <PhoneInput 
                        value={formData.phone} 
                        onChange={(v) => setFormData({...formData, phone: v})} 
                        onNext={handleNextField} 
                    />
                    <OperationInput 
                        value={formData.operation} 
                        onChange={(v) => setFormData({...formData, operation: v})} 
                        onNext={handleNextField} 
                    />
                    <DiagnosisModule 
                        value={formData.diagnosis} 
                        onChange={(v) => setFormData({...formData, diagnosis: v})} 
                        onNext={handleNextField} 
                    />
                    <EmbgModule 
                        value={formData.embg} 
                        onChange={(v) => setFormData({...formData, embg: v})} 
                        onNext={handleNextField} 
                    />
                    
                    <div className="d-flex gap-2 mt-3">
                        <button type="button" className="btn-submit flex-grow-1" onClick={() => handleSubmit(false)}>ВНЕСИ</button>
                        <button type="button" className="btn-urgent" onClick={() => handleSubmit(true)}>ИТНО !</button>
                    </div>

                    
                    <div className="mt-5 pt-3 border-top border-secondary">
                        <button 
                            type="button" 
                            className="btn btn-outline-danger w-100" 
                            onClick={handleLogout}
                            style={{ fontWeight: 'bold' }}
                        >
                            ОДЈАВИ СЕ
                        </button>
                    </div>
                </form>
            </aside>

            <main className="main-content-admin">
                <header className="content-header d-flex justify-content-between align-items-center">
                    <div className="tab-container-nav">
                        <div className="tab-menu">
                            <button 
                                className={`tab-link ${activeTab === 'call' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('call')}
                            >
                                Листа за Повик
                                ({counts.call})
                            </button>
                            <button 
                                className={`tab-link ${activeTab === 'waiting' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('waiting')}
                            >
                                Чекална
                                ({counts.waiting})
                            </button>
                            <button 
                                className={`tab-link ${activeTab === 'trash' ? 'active' : ''}`} 
                                onClick={() => setActiveTab('trash')}
                            >
                                Корпа
                                ({counts.trash})
                            </button>
                        </div>
                    </div>
                    <SearchInput value={searchTerm} onChange={setSearchTerm} />
                </header>

                <PatientTable 
                    type={activeTab}
                    patients={patients} 
                    editingField={editingField} 
                    setEditingField={setEditingField} 
                    handleLiveEdit={handleLiveEdit} 
                    saveField={saveField}
                    onAction={(updatedPatient) => saveField(updatedPatient)}
                    
                />
            </main>
        </div>
    );
}

export default App;