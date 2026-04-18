'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface TimeInputProps {
    defaultValue?: string;
    style?: React.CSSProperties;
    required?: boolean;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
    ({ defaultValue = '', style, required }, ref) => {
        const [hour, setHour] = useState('');
        const [minute, setMinute] = useState('');

        const hiddenInputRef = useRef<HTMLInputElement>(null);
        const minuteInputRef = useRef<HTMLInputElement>(null);

        const timeOptions: string[] = [];
        for (let h = 0; h < 24; h++) {
            for (let m of ['00', '15', '30', '45']) {
                const hh = h.toString().padStart(2, '0');
                timeOptions.push(`${hh}:${m}`);
            }
        }

        useImperativeHandle(ref, () => hiddenInputRef.current as HTMLInputElement);

        useEffect(() => {
            if (defaultValue && defaultValue.includes(':')) {
                const [h, m] = defaultValue.split(':');
                setHour(h);
                setMinute(m);
            }
        }, [defaultValue]);

        useEffect(() => {
            if (hiddenInputRef.current) {
                const formattedHour = hour ? hour.padStart(2, '0') : '';
                const formattedMinute = minute ? minute.padStart(2, '0') : '';

                if (formattedHour && formattedMinute) {
                    hiddenInputRef.current.value = `${formattedHour}:${formattedMinute}`;
                } else if (!formattedHour && !formattedMinute) {
                    hiddenInputRef.current.value = '';
                } else {
                    hiddenInputRef.current.value = `${formattedHour || '00'}:${formattedMinute || '00'}`;
                }
            }
        }, [hour, minute]);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            const target = e.target;
            setTimeout(() => {
                try { target.select(); } catch (err) { }
            }, 10);
        };

        const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 2) val = val.slice(0, 2);
            if (val && parseInt(val) > 23) val = '23';
            setHour(val);

            if (val.length === 2 && minuteInputRef.current) {
                minuteInputRef.current.focus();
            }
        };

        const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 2) val = val.slice(0, 2);
            if (val && parseInt(val) > 59) val = '59';
            setMinute(val);
        };

        const handleHourBlur = () => {
            if (hour && hour.length === 1) {
                setHour(`0${hour}`);
            }
        };

        const handleMinuteBlur = () => {
            if (minute && minute.length === 1) {
                setMinute(`0${minute}`);
            }
        };

        const getClosestTimeValue = () => {
            if (!hour || !minute) return '';

            let h = parseInt(hour, 10);
            let m = parseInt(minute, 10);

            if (isNaN(h) || isNaN(m)) return '';

            const roundedM = Math.round(m / 15) * 15;

            if (roundedM === 60) {
                h = (h + 1) % 24;
                m = 0;
            } else {
                m = roundedM;
            }

            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        const inputStyle: React.CSSProperties = {
            width: '100%',
            maxWidth: '3rem',
            textAlign: 'center' as const,
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            padding: 0,
            backgroundColor: 'transparent',
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '2px' }}>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="--"
                        value={hour}
                        onChange={handleHourChange}
                        onFocus={handleFocus}
                        onBlur={handleHourBlur}
                        maxLength={2}
                        style={inputStyle}
                        aria-label="時"
                    />
                    <span style={{ fontWeight: 'bold', userSelect: 'none' }}>:</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="--"
                        value={minute}
                        onChange={handleMinuteChange}
                        onFocus={handleFocus}
                        onBlur={handleMinuteBlur}
                        maxLength={2}
                        ref={minuteInputRef}
                        style={inputStyle}
                        aria-label="分"
                    />
                </div>

                {/* Native Picker Trigger Overlay */}
                <div style={{ position: 'relative', width: '20px', height: '20px', marginLeft: '8px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <select
                        value={getClosestTimeValue()}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val && val.includes(':')) {
                                const [h, m] = val.split(':');
                                setHour(h);
                                setMinute(m);
                            } else if (!val) {
                                setHour('');
                                setMinute('');
                            }
                        }}
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
                    >
                        <option value="">-- クリア --</option>
                        {timeOptions.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <input type="hidden" ref={hiddenInputRef} required={required} />
            </div>
        );
    }
);

TimeInput.displayName = 'TimeInput';
