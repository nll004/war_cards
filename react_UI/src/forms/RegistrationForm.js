import React, { useState, useContext, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "./Forms.css";

function RegistrationForm({ showForm }) {
    const [formData, setFormData] = useState(null);
    const [errors, setErrors] = useState(null);
    const { registerNewUser } = useContext(AuthContext);

    const [isOpen, setIsOpen] = useState(true);
    const componentRef = useRef();

    useEffect(() => {           // closes form when you click off component
        function handleClickOutside(evt) {
            if (componentRef.current && !componentRef.current.contains(evt.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [componentRef]);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setFormData(fData => ({ ...fData, [name]: value }));
    };

    async function handleSubmit(evt) {
        evt.preventDefault();
        let result = await registerNewUser(formData);
        if (result && result.errors) setErrors(result.errors);
    };

    return (
        <>
            {!isOpen && <Navigate to='/' />}
            <div ref={componentRef} >
                <form   onSubmit={handleSubmit} >
                    <h2 className="Form-header">Create your account</h2>
                    {errors && <p className="Form-error"> {errors[0]} </p>}
                    <input className="Form-input"
                        type='text'
                        placeholder="Create an username"
                        required
                        name="username"
                        autoComplete="username"
                        onChange={handleChange} />
                    <input className="Form-input"
                        type='text'
                        placeholder="Enter your first name"
                        required
                        name="firstName"
                        autoComplete="given-name"
                        onChange={handleChange} />
                    <input className="Form-input"
                        type='text'
                        placeholder="Enter your last name"
                        required
                        name="lastName"
                        autoComplete="family-name"
                        onChange={handleChange} />
                    <input className="Form-input"
                        type='email'
                        placeholder="Enter your email"
                        required
                        name="email"
                        autoComplete="email"
                        onChange={handleChange} />
                    <input className="Form-input"
                        type='password'
                        placeholder="Create a password"
                        required
                        name="password"
                        autoComplete="new-password"
                        onChange={handleChange} />
                    <button className="Form-submit-btn">
                        Signup
                    </button>
                </form>
                <div>
                    <p> Why sign up?</p>
                    <p> Create your free account </p>
                    <p> Track your battles </p>
                    <p> View your stats </p>
                    <p> Edit your preferences </p>
                </div>
            </div>
        </>
    )
};

export default RegistrationForm;
