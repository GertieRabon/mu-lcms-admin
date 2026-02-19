import { useState, useEffect } from 'react';
import { submitStudentLog } from '../services/clearanceService';
import { Button } from '../components/ui/Button';
import '../styles/student-log.css';
import { PROGRAM_LIST } from '../data/programs';
import { PURPOSE_LIST } from '../data/purpose';

const StudentLoggingForm = () => {
    const [form, setForm] = useState({
        studentNo: '',
        firstName: '',
        middleName: '',
        lastName: '',
        program: '',
        purpose: [] // Initialized as array for multiple checkmarks
    });

    // Background Sync Effect
    useEffect(() => {
        const handleSync = async () => {
            if (navigator.onLine) {
                const queue = JSON.parse(localStorage.getItem('offline_logs') || '[]');
                if (queue.length === 0) return;

                console.log(`Attempting to sync ${queue.length} queued logs...`);
                const remainingQueue = [];

                for (const item of queue) {
                    try {
                        const submissionData = { ...item, purpose: item.purpose.join(', ') };
                        await submitStudentLog(submissionData);
                    } catch (err) {
                        remainingQueue.push(item); // Keep in queue if sync fails
                    }
                }

                localStorage.setItem('offline_logs', JSON.stringify(remainingQueue));
                if (remainingQueue.length === 0) {
                    alert("All offline logs have been synchronized!");
                }
            }
        };

        window.addEventListener('online', handleSync);
        return () => window.removeEventListener('online', handleSync);
    }, []);

    const handlePurposeChange = (purposeName) => {
        setForm(prev => {
            const isSelected = prev.purpose.includes(purposeName);
            if (isSelected) {
                // Remove from array to uncheck
                return { ...prev, purpose: prev.purpose.filter(p => p !== purposeName) };
            } else {
                // Add to array to check and show tick
                return { ...prev, purpose: [...prev.purpose, purposeName] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.purpose.length === 0) {
            alert("Please select at least one purpose.");
            return;
        }

        if (!navigator.onLine) {
            const queue = JSON.parse(localStorage.getItem('offline_logs') || '[]');
            localStorage.setItem('offline_logs', JSON.stringify([...queue, form]));
            alert("Offline: Log queued locally.");
            return;
        }

        const submissionData = {
            ...form,
            purpose: form.purpose.join(', ') // Formats array for Supabase text column
        };

        try {
            await submitStudentLog(submissionData);
            alert("Log submitted successfully!");
            setForm({ studentNo: '', firstName: '', middleName: '', lastName: '', program: '', purpose: [] });
        } catch (err) {
            console.error("Submission failed:", err);
            alert("Error: " + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-row">
                <div className="form-group">
                    <label>Student Number</label>
                    <input
                        type="text"
                        value={form.studentNo}
                        onChange={(e) => setForm({...form, studentNo: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Program</label>
                    <select
                        value={form.program}
                        onChange={(e) => setForm({...form, program: e.target.value})}
                        required
                        className="form-select"
                    >
                        <option value="" disabled>Select Program</option>
                        {PROGRAM_LIST.map((prog) => (
                            <option key={prog.code} value={prog.code}>
                                {prog.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <hr className="line" />

            <div className="form-row name-row">
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => setForm({...form, firstName: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Middle Name</label>
                    <input
                        type="text"
                        value={form.middleName}
                        onChange={(e) => setForm({...form, middleName: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => setForm({...form, lastName: e.target.value})}
                        required
                    />
                </div>
            </div>

            <hr className="line" />

            <div className="form-row">
                <div className="form-group" style={{width: '100%'}}>
                    <label>Purpose</label>
                    <div className="checkbox-group">
                        {PURPOSE_LIST.map((item) => (
                            <label key={item.code} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={form.purpose.includes(item.name)}
                                    onChange={() => handlePurposeChange(item.name)}
                                />
                                <span>{item.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <Button type="submit" variant="primary" style={{width: '100%'}}>
                Submit Request
            </Button>
        </form>
    );
};

export default StudentLoggingForm;
