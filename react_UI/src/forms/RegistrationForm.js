import React, { useState, useContext, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Container, Input, Button, Form, FormGroup, Label, Row, Col } from "reactstrap";
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
        if (result && result.errors) return setErrors(result.errors);
        return setIsOpen(false);
    };

    return (
        <div ref={componentRef} className='Form-container'>
            {!isOpen && <Navigate to='/' />}
            <Container fluid='sm' className="bg-light border" >
                <Row>
                    <Col>
                        <Form onSubmit={handleSubmit} >
                            <Row xs='4'>
                                <Col> <h2 className="Form-header">Signup</h2> </Col>
                                <Col xs='6'> {errors && <p className="Form-error"> {errors[0]} </p>} </Col>
                            </Row>
                            <FormGroup  floating>
                                <Input  id="regUsername"
                                        placeholder="Create an username"
                                        required
                                        min='6'
                                        max='12'
                                        name="username"
                                        autoComplete="username"
                                        onChange={handleChange} />
                                <Label  for="regUsername"> Username </Label>
                            </FormGroup>
                            <FormGroup  floating>
                                <Input  id="regFirstName"
                                        placeholder="Enter your first name"
                                        required
                                        name="firstName"
                                        autoComplete="given-name"
                                        onChange={handleChange} />
                                <Label  for="regFirstName">First Name</Label>
                            </FormGroup>
                            <FormGroup  floating>
                                <Input  id='regLastName'
                                        placeholder="Enter your last name"
                                        required
                                        name="lastName"
                                        autoComplete="family-name"
                                        onChange={handleChange} />
                                <Label  for='regLastName'> Last Name </Label>
                            </FormGroup>
                            <FormGroup  floating>
                                <Input  id='regEmail'
                                        type='email'
                                        placeholder="Enter your email"
                                        required
                                        name="email"
                                        autoComplete="email"
                                        onChange={handleChange} />
                                <Label  for='regEmail'> Email </Label>
                            </FormGroup>
                            <FormGroup  floating>
                                <Input  id='regPassword'
                                        required
                                        type='password'
                                        min='8'
                                        placeholder="Create a password"
                                        name="password"
                                        autoComplete="new-password"
                                        onChange={handleChange} />
                                <Label for='regPassword'> Password </Label>
                            </FormGroup>
                            <Button className="Form-submit-btn"> Register </Button>
                        </Form>
                    </Col>
                    <Col xs='4' id="reg-info">
                        <Container fluid='sm' className="bg-dark border">
                            <h3 style={{marginTop: "10px", color: "whitesmoke"}}> Why sign up?</h3>
                            <hr style={{color: "white"}}/>
                            <p className="reg-info-text"> Track your battles </p>
                            <p className="reg-info-text"> View your stats </p>
                            <p className="reg-info-text"> Edit your preferences </p>
                        </Container>
                    </Col>
                </Row>
            </Container>
        </div>
    )
};

export default RegistrationForm;
