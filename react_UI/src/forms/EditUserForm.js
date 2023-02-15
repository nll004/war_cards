import React, { useState, useContext } from "react";
import { WarApi } from "../apis/WarAPI";
import UserContext from '../context/UserContext';

function EditUserForm({ showForm }) {
    const { currentUser } = useContext(UserContext);
    const [formData, setFormData] = useState(null);
    const [errors, setErrors] = useState(null);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setFormData(fData => ({ ...fData, [name]: value }));
    };

    async function handleSubmit(evt) {
        evt.preventDefault();
        try{
            await WarApi.editUser(currentUser.username, formData);
            setFormData(null);
        }catch(errors) {
            setErrors(errors);
        }
    };

    return (
        <div className="Form-container">
            <h3 className="Form-header"> Edit User </h3>
            {errors && <p className="Form-error">{errors[0]}</p>}
            <form onSubmit={handleSubmit}>
                <label className="Form-label"
                    htmlFor="firstName">
                    First Name
                </label>
                <input className="Form-input"
                    type='text'
                    placeholder="Enter your first name"
                    name="firstName"
                    onChange={handleChange} />
                <label className="Form-label"
                    htmlFor="lastName">
                    Last Name
                </label>
                <input className="Form-input"
                    type='text'
                    placeholder="Enter your last name"
                    name="lastName"
                    onChange={handleChange} />
                <label className="Form-label"
                    htmlFor="email">
                    Email
                </label>
                <input className="Form-input"
                    type='email'
                    placeholder="Enter new email"
                    name="email"
                    onChange={handleChange} />
                <label className="Form-label"
                    htmlFor="password">
                    Password
                </label>
                <input className="Form-input"
                    type='password'
                    placeholder="Enter new password"
                    name="password"
                    value={null}
                    onChange={handleChange} />
                <button className="Form-submit-btn">
                    Save
                </button>
                <button onClick={() => showForm(false)}
                    className='Form-close-btn'>
                    X
                </button>
            </form>
        </div>
    )
}

export default EditUserForm;
