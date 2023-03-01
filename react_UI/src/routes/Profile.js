import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Container, Card, CardTitle, CardBody, CardHeader, Row, Col } from "reactstrap";
import UserContext from '../context/UserContext';
import "./Profile.css";

function UserProfile(){
    const { currentUser } = useContext(UserContext);

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

    return (
        <div ref={componentRef} id="Prof-card">
            {!isOpen && <Navigate to='/' />}
            <Container >
                <Card color="secondary" outline style={{marginTop: "2%"}}>
                    <CardHeader>
                        <Row>
                            <Col> <CardTitle tag='h3'> User Info </CardTitle> </Col>
                            <Col xs="3"> <Link to='/player-edit'> Edit </Link> </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        {currentUser && <>
                            <p> Username:   {currentUser.username} </p>
                            <p> Name:       {currentUser.firstName + ' ' + currentUser.lastName} </p>
                            <p> Email:      {currentUser.email} </p>
                        </>}
                    </CardBody>
                </Card>
                <Card color="secondary" outline style={{ width: "100%", height: "auto", margin: "2% 0" }}>
                    <CardHeader>
                        <CardTitle tag='h3'> Player Stats </CardTitle>
                    </CardHeader>
                    <CardBody>
                        {currentUser && <>
                                <p>Games Played:    {currentUser.stats.gamesPlayed} </p>
                                <p>Games Won:       {currentUser.stats.gamesWon}
                                    <span> --       {Math.floor((currentUser.stats.gamesWon / currentUser.stats.gamesPlayed) * 100) || 0}% </span>
                                </p>
                                <p>Games Lost:      {currentUser.stats.gamesPlayed - currentUser.stats.gamesWon} </p>
                                <p>Battles:         {currentUser.stats.battles} </p>
                                <p>Battles Won:     {currentUser.stats.battlesWon}
                                    <span> --       {Math.floor((currentUser.stats.battlesWon / currentUser.stats.battles) * 100) || 0}% </span>
                                </p>
                                <p>Battles Lost:    {currentUser.stats.battles - currentUser.stats.battlesWon} </p>
                        </>}
                    </CardBody>
                </Card>
            </Container>
        </div>
    )
};

export default UserProfile;
