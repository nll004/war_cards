import React, {useState, useContext} from "react";
import AuthContext from "../context/AuthContext";

function LoginForm({showForm}) {
    const [formData, setFormData] = useState(null);
    const [errors, setErrors] = useState(null);
    const { userLogin } = useContext(AuthContext);

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
        <form onSubmit={handleSubmit}>
            <h2 className="Form-header"> Login </h2>
            {errors && <p className="Form-error">{ errors[0] }</p>}
                <input  className="Form-input"
                        type='text'
                        required
                        name='username'
                        placeholder="Username"
                        autoComplete="username"
                        onChange={handleChange}
                    />
                <input  className="Form-input"
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
            <button onClick={() => showForm(false)}
                    className='Form-close-btn'>
                X
            </button>
        </form>
    )
};

export default LoginForm;
