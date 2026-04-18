'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface DateInputProps {
    defaultValue?: string; // YYYY-MM-DD format
    style?: React.CSSProperties;
    required?: boolean;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
    ({ defaultValue = '', style, required }, ref) => {
        const [year, setYear] = useState('');
        const [month, setMonth] = useState('');
        const [day, setDay] = useState('');

        const hiddenInputRef = useRef<HTMLInputElement>(null);
        const monthInputRef = useRef<HTMLInputElement>(null);
        const dayInputRef = useRef<HTMLInputElement>(null);
        const nativeDateRef = useRef<HTMLInputElement>(null);

        useImperativeHandle(ref, () => hiddenInputRef.current as HTMLInputElement);

        useEffect(() => {
            if (defaultValue) {
                const parts = defaultValue.split('-');
                if (parts.length >= 3) {
                    setYear(parts[0]);
                    setMonth(parts[1]);
                    setDay(parts[2]);
                }
            }
        }, [defaultValue]);

        useEffect(() => {
            if (hiddenInputRef.current) {
                const formattedYear = year.padStart(4, '0');
                const formattedMonth = month.padStart(2, '0');
                const formattedDay = day.padStart(2, '0');

                if (year && month && day) {
                    hiddenInputRef.current.value = `${formattedYear}-${formattedMonth}-${formattedDay}`;
                } else {
                    hiddenInputRef.current.value = '';
                }
            }
        }, [year, month, day]);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            const target = e.target;
            setTimeout(() => {
                try { target.select(); } catch (err) { }
            }, 10);
        };

        const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 4) val = val.slice(0, 4);
            setYear(val);

            if (val.length === 4 && monthInputRef.current) {
                monthInputRef.current.focus();
            }
        };

        const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 2) val = val.slice(0, 2);
            if (val && parseInt(val) > 12) val = '12';
            setMonth(val);

            if (val.length === 2 && dayInputRef.current) {
                dayInputRef.current.focus();
            }
        };

        const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 2) val = val.slice(0, 2);
            if (val && parseInt(val) > 31) val = '31';
            setDay(val);
        };

        const handleBlurScale = (setter: React.Dispatch<React.SetStateAction<string>>, val: string, pad: number) => {
            if (val && val.length < pad) {
                setter(val.padStart(pad, '0'));
            }
        };

        const syncFromNative = () => {
            if (nativeDateRef.current) {
                const val = nativeDateRef.current.value;
                if (val) {
                    const [y, m, d] = val.split('-');
                    if (y !== year || m !== month || d !== day) {
                        setYear(y); setMonth(m); setDay(d);
                    }
                } else {
                    if (year || month || day) {
                        setYear(''); setMonth(''); setDay('');
                    }
                }
            }
        };

        // Uncontrolled bridge for Native Picker
        useEffect(() => {
            if (nativeDateRef.current) {
                if (year && month && day) {
                    nativeDateRef.current.value = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                } else {
                    nativeDateRef.current.value = '';
                }
            }
        }, [year, month, day]);

        const inputStyle: React.CSSProperties = {
            textAlign: 'center' as const,
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            padding: 0,
            backgroundColor: 'transparent',
            width: '100%'
        };

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '0.75rem',
                backgroundColor: 'white',
                ...style
            }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="YYYY"
                        value={year}
                        onChange={handleYearChange}
                        onFocus={handleFocus}
                        onBlur={() => handleBlurScale(setYear, year, 4)}
                        maxLength={4}
                        style={{ ...inputStyle, maxWidth: '3.5rem' }}
                    />
                    <span style={{ margin: '0 4px', color: '#666' }}>/</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="MM"
                        value={month}
                        onChange={handleMonthChange}
                        onFocus={handleFocus}
                        onBlur={() => handleBlurScale(setMonth, month, 2)}
                        maxLength={2}
                        ref={monthInputRef}
                        style={{ ...inputStyle, maxWidth: '2rem' }}
                    />
                    <span style={{ margin: '0 4px', color: '#666' }}>/</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="DD"
                        value={day}
                        onChange={handleDayChange}
                        onFocus={handleFocus}
                        onBlur={() => handleBlurScale(setDay, day, 2)}
                        maxLength={2}
                        ref={dayInputRef}
                        style={{ ...inputStyle, maxWidth: '2rem' }}
                    />
                </div>

                {/* Native Picker Trigger Overlay */}
                <div
                    style={{ position: 'relative', width: '20px', height: '20px', marginLeft: '8px', cursor: 'pointer' }}
                    onClick={() => {
                        try {
                            if (nativeDateRef.current && typeof nativeDateRef.current.showPicker === 'function') {
                                nativeDateRef.current.showPicker();
                            }
                        } catch (e) { }
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <input
                        type="date"
                        ref={nativeDateRef}
                        onChange={syncFromNative}
                        onBlur={syncFromNative}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer',
                            fontSize: '16px' // iOS zoom prevention
                        }}
                    />
                </div>

                <input type="hidden" ref={hiddenInputRef} required={required} />
            </div>
        );
    }
);

DateInput.displayName = 'DateInput';
