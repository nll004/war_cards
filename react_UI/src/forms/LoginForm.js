import React, { useState, useContext, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import {Container, Input, Button, Form, FormGroup, Label, Row, Col} from "reactstrap";
import AuthContext from "../context/AuthContext";
import "./Forms.css";

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
        if (result && result.errors) return setErrors(result.errors);
        return setIsOpen(false);
    };

    return (
        <div ref={componentRef} className='Form-container'>
            {!isOpen && <Navigate to='/' />}
            <Container fluid='sm' className="bg-light border">
                <Form onSubmit={handleSubmit} >
                    <Row xs='4'>
                        <Col >
                            <h3 className="Form-header"> Login </h3>
                        </Col>
                        <Col xs='6'>
                            {errors && <p className="Form-error">{errors[0]}</p>}
                        </Col>
                    </Row>
                    <FormGroup floating>
                        <Input  id="loginUsername"
                                name='username'
                                placeholder="Username"
                                autoComplete="username"
                                required
                                onChange={handleChange}
                                className='Form-input'
                        />
                        <Label for='loginUsername'> Username </Label>
                    </FormGroup>
                    <FormGroup floating>
                        <Input  id="loginPassword"
                                type='password'
                                name='password'
                                placeholder="Password"
                                autoComplete='current-password'
                                required
                                onChange={handleChange}
                                className='Form-input'
                        />
                        <Label for='loginPassword'> Password </Label>
                    </FormGroup>
                    <Button className="Form-submit-btn"> Login </Button>
                </Form>
            </Container>
        </div>
    )
};

export default LoginForm;
