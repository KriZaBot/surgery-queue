import React, { useEffect, useRef } from 'react';
import { NameFields, EmbgModule, PhoneInput, OperationInput, DiagnosisModule } from './PatientComponents';

const PatientTable = ({ 
    patients, type, editingField, setEditingField, handleLiveEdit, 
    saveField, onAction 
}) => {
    const overlayRef = useRef(null);

    const TAB_CONFIG = {
        call: { 
            filter: (p) => p.position > 0 && !p.status, 
            showRank: true 
        },
        waiting: { 
            filter: (p) => p.position < 0 && (p.status === 'confirmed' || p.status === 'priority'), 
            showRank: false 
        },
        trash: { 
            filter: (p) => p.position < 0 && p.status === 'canceled', 
            showRank: false 
        }
    };

    const STATUS_LABELS = {
        confirmed: 'Потврден',
        priority: 'ИТНО',
        canceled: 'Откажан',
        completed: 'Примен',
        none: 'Во план'
    };

    const ALL_ACTIONS = [
        {
            label: 'ПОТВРДИ',
            className: 'btn btn-success',
            statusUpdate: 'confirmed',
            shouldShow: (t, p) => t === 'call' && p.position <= 10
        },
        {
            label: 'ИТНО !',
            className: 'btn btn-danger btn-urgent',
            statusUpdate: 'priority',
            shouldShow: (t, p) => t === 'call' && p.position > 10
        },
        {
            label: 'ОТКАЖИ',
            className: 'btn btn-outline-danger',
            statusUpdate: 'canceled',
            shouldShow: (t) => t === 'call'
        },
        {
            label: 'ПРИМЕН ✓',
            className: 'btn btn-primary',
            statusUpdate: 'completed',
            shouldShow: (t) => t === 'waiting'
        },
        {
            label: 'ВРАТИ ↩',
            className: 'btn btn-warning',
            statusUpdate: null,
            shouldShow: (t) => t === 'waiting' || t === 'trash'
        }
    ];

    const filteredDisplay = patients.filter(p => TAB_CONFIG[type]?.filter(p) ?? false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (overlayRef.current && !overlayRef.current.contains(e.target)) {
                setEditingField({ id: null, field: null });
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setEditingField]);

    return (
        <section className="table-container">
            <table className="main-table">
                <thead>
                    <tr>
                        {TAB_CONFIG[type].showRank && <th className="rank-col">#</th>}
                        <th>Пациент</th>
                        <th>ЕМБГ / Тел</th>
                        <th>Дијагноза / Операција</th>
                        <th>Статус</th>
                        <th className="text-center">Акција</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredDisplay.map((p) => {
                        const isEditing = editingField.id === p.id;
                        const isTop10 = p.position <= 10 && p.position > 0;

                        return (
                            <tr key={p.id} className={type === 'call' && isTop10 ? 'top-10-row' : ''}>
                                {TAB_CONFIG[type].showRank && (
                                    <td>
                                        <span className={`rank-badge ${p.status === 'priority' ? 'priority' : ''}`}>
                                            {p.position}
                                        </span>
                                    </td>
                                )}

                                <td className="pos-relative">
                                    <div className="cell-content">
                                        <span className="patient-name">{p.first_name} {p.last_name}</span>
                                        <button className="edit-small-btn" onClick={() => setEditingField({id: p.id, field: 'name'})}>✎</button>
                                    </div>
                                    {isEditing && editingField.field === 'name' && (
                                        <div className="edit-overlay-under name-popup" ref={overlayRef}>
                                            <NameFields isEdit firstName={p.first_name} lastName={p.last_name}
                                                onFirstChange={(v) => handleLiveEdit(p.id, 'first_name', v)}
                                                onLastChange={(v) => handleLiveEdit(p.id, 'last_name', v)}
                                                onNext={() => saveField(p)} />
                                            <button className="edit-confirm-btn" onClick={() => saveField(p)}>✓</button>
                                        </div>
                                    )}
                                </td>

                                <td className="pos-relative">
                                    <div className="cell-content">
                                        <div><strong>{p.embg}</strong><br/><small className="text-muted">{p.phone}</small></div>
                                        <button className="edit-small-btn" onClick={() => setEditingField({id: p.id, field: 'contact'})}>✎</button>
                                    </div>
                                    {isEditing && editingField.field === 'contact' && (
                                        <div className="edit-overlay-under contact-popup" ref={overlayRef}>
                                            <div className="popup-inner-content">
                                                <EmbgModule isEdit value={p.embg} onChange={(v) => handleLiveEdit(p.id, 'embg', v)} onNext={() => {}} />
                                                <div className="mt-2">
                                                    <PhoneInput isEdit value={p.phone} onChange={(v) => handleLiveEdit(p.id, 'phone', v)} onNext={() => saveField(p)} />
                                                </div>
                                            </div>
                                            <button className="edit-confirm-btn" onClick={() => saveField(p)}>✓</button>
                                        </div>
                                    )}
                                </td>

                                <td className="pos-relative">
                                    <div className="cell-content">
                                        <div className="diag-text">{p.diagnosis || "/"}</div>
                                        <button className="edit-small-btn" onClick={() => setEditingField({id: p.id, field: 'medical'})}>✎</button>
                                    </div>
                                    <span className="op-text-small">{p.operation_name || "/"}</span>
                                    {isEditing && editingField.field === 'medical' && (
                                        <div className="edit-overlay-under medical-popup" ref={overlayRef}>
                                            <div className="popup-inner-content">
                                                <OperationInput isEdit value={p.operation} onChange={(v) => handleLiveEdit(p.id, 'operation', v)} onNext={() => {}} />
                                                <div className="mt-2">
                                                    <DiagnosisModule isEdit value={p.diagnosis} onChange={(v) => handleLiveEdit(p.id, 'diagnosis', v)} onNext={() => saveField(p)} />
                                                </div>
                                            </div>
                                            <button className="edit-confirm-btn" onClick={() => saveField(p)}>✓</button>
                                        </div>
                                    )}
                                </td>

                                <td>
                                    <span className={`status-pill ${p.status || 'none'}`}>
                                        {STATUS_LABELS[p.status] || STATUS_LABELS.none}
                                    </span>
                                </td>

                                <td>
                                    <div className="action-column">
                                        {ALL_ACTIONS.map(action => 
                                            action.shouldShow(type, p) && (
                                                <button 
                                                    key={action.label} 
                                                    className={action.className} 
                                                    onClick={() => onAction({...p, status: action.statusUpdate})}
                                                >
                                                    {action.label}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </section>
    );
};

export default PatientTable;