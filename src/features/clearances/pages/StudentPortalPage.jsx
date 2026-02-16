import React from 'react';
import StudentLoggingForm from '../components/StudentLoggingForm';
import { Button } from '../../../components/ui';
import '../student-log.css';

const StudentPortalPage = () => {

    return (
        <div className="auth-container">
            <div className="auth-form">

                <div className="portal-header">
                    <h2 className="portal-title">Clearance Request Form</h2>
                </div>

                <div className="portal-body">
                    <StudentLoggingForm />
                </div>
                <p className="portal-footer-text">
                    Please ensure your Student Number is correct before submitting.
                </p>
            </div>
        </div>
    );
};

export default StudentPortalPage;