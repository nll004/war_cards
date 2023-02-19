import React, { useState, useContext, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function LoginForm() {
    const [formData, setFormData] = useState(null);
    const [errors, setErrors] = useState(null);
    const { userLogin } = useContext(AuthContext);

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

    function handleChange(evt) {
        const { name, value } = evt.target;
        setFormData(fData => ({ ...fData, [name]: value }));
    };

    async function handleSubmit(evt){
        evt.preventDefault();
        let result = await userLogin(formData);
        if (result && result.errors) setErrors(result.errors);
    };

    return (
        <>
            {!isOpen && <Navigate to='/' />}
            <div ref={componentRef}>
                <form onSubmit={handleSubmit} >
                    <h2 className="Form-header"> Login </h2>
                    {errors && <p className="Form-error">{errors[0]}</p>}
                    <input className="Form-input"
                        type='text'
                        required
                        name='username'
                        placeholder="Username"
                        autoComplete="username"
                        onChange={handleChange}
                    />
                    <input className="Form-input"
                        type='password'
                        required
                        name='password'
                        placeholder="Password"
                        autoComplete='current-password'
                        onChange={handleChange}
                    />
                    <button className="Form-submit-btn">
                        Login
                    </button>
                </form>
            </div>
        </>
    )
};

export default LoginForm;
