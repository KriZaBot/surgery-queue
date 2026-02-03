import React, { useState } from 'react';
import axios from 'axios';
import { PatientStatus } from './types';

interface PatientPublicData {
    first_name: string;
    last_name: string;
    status: PatientStatus;
    position: number;
}

const PatientPublic = () => {
    const [credentials, setCredentials] = useState({ embg: '', access_code: '' });
    const [data, setData] = useState<PatientPublicData | null>(null);

    const checkStatus = () => {
        axios.post<PatientPublicData>('http://127.0.0.1:8000/api/patients/public-check/', credentials)
            .then(res => {
                setData(res.data);
            })
            .catch((err) => {
                console.error(err);
                alert("Погрешен ЕМБГ или Код!");
            });
    };

    return (
        <div className="container mt-5 text-center">
            {!data ? (
                <div className="card p-4 shadow-sm mx-auto" style={{maxWidth: '400px', borderRadius: '15px'}}>
                    <h3 className="mb-4">Проверка на термин</h3>
                    
                    <div className="mb-3 text-start">
                        <label className="form-label">Вашиот ЕМБГ:</label>
                        <input 
                            className="form-control" 
                            placeholder="Внесете го матичниот број на пациентот" 
                            onChange={e => setCredentials({...credentials, embg: e.target.value})} 
                        />
                    </div>

                    <div className="mb-4 text-start">
                        <label className="form-label">Вашиот Код:</label>
                        <input 
                            className="form-control" 
                            placeholder="Внесете го 6-цифрениот код" 
                            onChange={e => setCredentials({...credentials, access_code: e.target.value})} 
                        />
                    </div>

                    <button className="btn btn-primary w-100 py-2" onClick={checkStatus}>
                        ПРОВЕРИ СТАТУС
                    </button>
                </div>
            ) : (
                <div className="card p-4 shadow-sm mx-auto" style={{maxWidth: '500px', borderRadius: '15px'}}>
                    <div className="text-success mb-3" style={{fontSize: '3rem'}}>●</div>
                    <h2>Здраво, {data.first_name}!</h2>
                    <p className="text-muted">{data.last_name}</p>
                    <hr />
                    
                    <div className="row mt-4">
                        <div className="col-6 text-start">
                            <p className="mb-0">Моментален статус:</p>
                            <h4 className="text-primary">{data.status || "Во план"}</h4>
                        </div>
                        <div className="col-6 text-end">
                            <p className="mb-0">Позиција во листа:</p>
                            <h4 className="text-dark"># {data.position}</h4>
                        </div>
                    </div>

                    <div className="alert alert-info mt-4">
                        Вашиот термин е евидентиран во системот.
                    </div>

                    <button 
                        className="btn btn-outline-secondary mt-3 w-100" 
                        onClick={() => setData(null)}
                    >
                        Назад кон пребарување
                    </button>
                </div>
            )}
        </div>
    );
};

export default PatientPublic;