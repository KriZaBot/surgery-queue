import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, KeyboardEvent, ChangeEvent } from 'react';
import axios from 'axios';
import { OperationType } from '../types';

const mkdMap: { [key: string]: string } = {
    'q': 'љ', 'w': 'њ', 'e': 'е', 'r': 'р', 't': 'т', 'y': 'ѕ', 'u': 'у', 'i': 'и', 'o': 'о', 'p': 'п', '[': 'ш', ']': 'ѓ',
    'a': 'а', 's': 'с', 'd': 'д', 'f': 'ф', 'g': 'г', 'h': 'х', 'j': 'ј', 'k': 'к', 'l': 'л', ';': 'ч', "'": 'ќ', '\\': 'ж',
    'z': 'з', 'x': 'џ', 'c': 'ц', 'v': 'в', 'b': 'б', 'n': 'н', 'm': 'м'
};

const applyMkd = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>, value: string, onChange: (val: string) => void) => {
    const char = mkdMap[e.key.toLowerCase()];
    if (char) {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        const start = target.selectionStart || 0;
        const end = target.selectionEnd || 0;
        let finalChar = (start === 0) ? char.toUpperCase() : char;
        const newVal = value.substring(0, start) + finalChar + value.substring(end);
        onChange(newVal);
        setTimeout(() => target.setSelectionRange(start + 1, start + 1), 0);
    }
};

export const SearchInput = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div className="search-box">
        <input 
            type="text" 
            className="form-control" 
            placeholder="Пребарај..." 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => applyMkd(e, value, onChange)}
        />
    </div>
);

interface NameFieldsProps {
    firstName: string;
    lastName: string;
    onFirstChange: (v: string) => void;
    onLastChange: (v: string) => void;
    onNext: (e: any) => void;
    isEdit?: boolean;
}

export const NameFields = forwardRef(({ firstName, lastName, onFirstChange, onLastChange, onNext, isEdit }: NameFieldsProps, ref) => {
    const fRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => ({ focusFirst: () => fRef.current?.focus() }));
    
    return (
        <div className={isEdit ? "edit-group-inline" : "input-group-custom"}>
            {!isEdit && <label className="input-label">Име и Презиме:</label>}
            <input 
                ref={fRef} 
                type="text" 
                className="form-control mb-1" 
                placeholder="Име" 
                value={firstName}
                onChange={(e) => onFirstChange(e.target.value)}
                onKeyDown={(e) => { applyMkd(e, firstName, onFirstChange); if (e.key === 'Enter') onNext(e); }} 
            />
            <input 
                type="text" 
                className="form-control" 
                placeholder="Презиме" 
                value={lastName}
                onChange={(e) => onLastChange(e.target.value)}
                onKeyDown={(e) => { applyMkd(e, lastName, onLastChange); if (e.key === 'Enter') onNext(e); }} 
            />
        </div>
    );
});

export const PhoneInput = ({ value, onChange, onNext, isEdit }: { value: string, onChange: (v: string) => void, onNext: (e: any) => void, isEdit?: boolean }) => (
    <div className={isEdit ? "" : "input-group-custom"}>
        {!isEdit && <label className="input-label">Телефон:</label>}
        <input 
            type="text" 
            className="form-control" 
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
            onKeyDown={(e) => e.key === 'Enter' && onNext(e)} 
        />
    </div>
);

export const OperationInput = ({ value, onChange, onNext, isEdit }: { value: number | string | null, onChange: (v: number) => void, onNext: (e: any) => void, isEdit?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [opList, setOpList] = useState<OperationType[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios.get<OperationType[]>('http://127.0.0.1:8000/api/operation-types/')
            .then(res => setOpList(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleSelect = (op: OperationType, e: any) => {
        onChange(op.id);
        setIsOpen(false);
        setIsAdding(false);
        if (onNext) onNext(e);
    };

    const handleSaveNew = (e: any) => {
        if (!newName.trim()) {
            setIsAdding(false);
            return;
        }
        axios.post<OperationType>('http://127.0.0.1:8000/api/operation-types/', { name: newName })
            .then(res => {
                setOpList([...opList, res.data]);
                handleSelect(res.data, e);
            });
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' && !isOpen) {
            setIsOpen(true);
            return;
        }
        if (e.key === 'Enter' && isOpen && !isAdding) {
            onNext(e);
            return;
        }
        if (!isAdding) {
            const num = parseInt(e.key);
            if (!isNaN(num) && num > 0 && num <= opList.length) {
                e.preventDefault();
                handleSelect(opList[num - 1], { target: dropdownRef.current });
            }
        }
    };

    return (
        <div className={isEdit ? "" : "input-group-custom position-relative"}>
            {!isEdit && <label className="input-label">Операција:</label>}
            <div 
                ref={dropdownRef} 
                className="form-control d-flex justify-content-between align-items-center pointer bg-white"
                onClick={() => !isAdding && setIsOpen(!isOpen)} 
                onKeyDown={handleKeyDown}
                tabIndex={0}
            >
                {opList.find(o => o.id === value)?.name || "Избери операција..."}
                <span>{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && (
                <div className="op-dropdown-list shadow">
                    {opList.map((op, i) => (
                        <div key={op.id} className="op-item" onClick={(e) => handleSelect(op, { target: dropdownRef.current })}>
                            <span className="op-number">{i + 1}.</span> {op.name}
                        </div>
                    ))}
                    <div className="op-add-section border-top">
                        {isAdding ? (
                            <div className="d-flex p-2">
                                <input autoFocus className="form-control form-control-sm" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSaveNew(e)} />
                                <button className="btn btn-sm btn-success ms-1" onClick={handleSaveNew}>✔</button>
                            </div>
                        ) : (
                            <div className="op-add-new text-primary p-2 pointer" onClick={(e) => { e.stopPropagation(); setIsAdding(true); }}>
                                + Додади нова
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const DiagnosisModule = forwardRef(({ value, onChange, onNext, isEdit }: { value: string, onChange: (v: string) => void, onNext: (e: any) => void, isEdit?: boolean }, ref: any) => (
    <div className={isEdit ? "wide-edit" : "input-group-custom"}>
        {!isEdit && <label className="input-label">Дијагноза:</label>}
        <textarea 
            ref={ref} 
            className="form-control diag-textarea" 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e: any) => (e.key === 'Enter' && (e.ctrlKey || isEdit)) && (e.preventDefault(), onNext(e))} 
        />
    </div>
));

export const EmbgModule = forwardRef(({ value = "", onChange, onNext, isEdit }: { value: string, onChange: (v: string) => void, onNext: (e: any) => void, isEdit?: boolean }, ref: any) => {
    const digits = value.padEnd(13, " ").split("").slice(0, 13);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    
    useImperativeHandle(ref, () => ({ 
        focus: () => inputs.current[0]?.focus() 
    }));
    
    const handleDigit = (v: string, i: number) => {
        const char = v.slice(-1);
        if (isNaN(Number(char)) && char !== "") return;
        const newDigits = [...digits];
        newDigits[i] = char || " ";
        onChange(newDigits.join("").trimEnd());
        if (char !== "" && i < 12) inputs.current[i + 1]?.focus();
    };

    return (
        <div className={isEdit ? "" : "input-group-custom"}>
            {!isEdit && <label className="input-label">ЕМБГ:</label>}
            <div className="embg-flex-container">
                {digits.map((d, i) => (
                    <input 
                        key={i} 
                        type="text" 
                        ref={(el) => { inputs.current[i] = el; }}
                        className={`embg-box ${d.trim() ? "filled" : ""}`} 
                        value={d.trim()} 
                        maxLength={1}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleDigit(e.target.value, i)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') onNext(e);
                            if (e.key === 'Backspace' && !d.trim() && i > 0) inputs.current[i - 1]?.focus();
                        }} 
                    />
                ))}
            </div>
        </div>
    );
});

export const PositionInput = ({ value, onChange, onNext, isEdit }: { value: number, onChange: (v: number) => void, onNext: (e: any) => void, isEdit?: boolean }) => (
    <div className={isEdit ? "flex-grow-1" : "input-group-custom"}>
        {!isEdit && <label className="input-label">Реден број:</label>}
        <input 
            type="number" 
            className="form-control" 
            value={value || ""} 
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            onKeyDown={(e) => e.key === 'Enter' && onNext(e)} 
        />
    </div>
);