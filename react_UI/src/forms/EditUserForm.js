import React, { useState, useContext, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { WarApi } from "../apis/WarAPI";
import { Container, Input, Button, Form, FormGroup, Label, Row, Col } from "reactstrap";
import UserContext from '../context/UserContext';
import "./Forms.css";

function EditUserForm() {
    const { currentUser } = useContext(UserContext);
    const [formData, setFormData] = useState(null);
    const [errors, setErrors] = useState(null);

    const [isOpen, setIsOpen] = useState(true);
    const form = useRef();

    useEffect(() => {           // closes form when you click off component
        function handleClickOutside(evt) {
            if (form.current && !form.current.contains(evt.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [form]);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setFormData(fData => ({ ...fData, [name]: value }));
    };

    async function handleSubmit(evt) {
        evt.preventDefault();
        try{
            await WarApi.editUser(currentUser.username, formData);
            setFormData(null);
            setIsOpen(false);
        }catch(errors) {
            setErrors(errors);
        }
    };

    return (
        <div ref={form} className="Form-container">
            {!isOpen && <Navigate to='/'/> }
            <Container fluid='sm' className="bg-light border">
                <Form onSubmit={handleSubmit} >
                    <Row xs='4'>
                        <Col> <h3 className="Form-header"> Edit User </h3> </Col>
                        <Col xs='6'> {errors && <p className="Form-error">{errors[0]}</p>} </Col>
                    </Row>
                    <FormGroup  floating>
                        <Input  id='editFirstName'
                                placeholder="Enter your first name"
                                name="firstName"
                                onChange={handleChange}/>
                        <Label  for='editFirstName'> First Name </Label>
                    </FormGroup>
                    <FormGroup  floating>
                        <Input  id='editLastName'
                                placeholder="Enter your last name"
                                name="lastName"
                                onChange={handleChange} />
                        <Label  for='editLastName'> Last Name </Label>
                    </FormGroup>
                    <FormGroup  floating>
                        <Input  id='editEmail'
                                type="email"
                                placeholder="Enter new email"
                                name="email"
                                onChange={handleChange} />
                        <Label  for='editEmail'> New Email </Label>
                    </FormGroup>
                    <FormGroup  floating>
                        <Input  id='editPassword'
                                type='password'
                                placeholder="Enter new password"
                                name="password"
                                onChange={handleChange} />
                        <Label  for='editPassword'> New Password </Label>
                    </FormGroup>
                    <Button className="Form-submit-btn"> Save </Button>
                </Form>
            </Container>
        </div>
    )
}

export default EditUserForm;
