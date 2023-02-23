import React, { useState, useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { Navbar, Nav, Collapse, NavbarToggler, NavItem, Button } from 'reactstrap';
import Game from "../gameComponents/Game";
import UserContext from '../context/UserContext';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

function HomePage(){
    const {currentUser} = useContext(UserContext);
    const {logout} = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return ( <>
        <header>
            <Navbar expand="sm" dark>
                <Link to='' className="Logo">
                    <img alt="Logo Home Link"
                        src={require("../images/war-logo.png")}
                        style={{ height: "8vh"}}
                    />
                </Link>
                <NavbarToggler onClick={toggle} type='button'/>
                <Collapse isOpen={isOpen} navbar>
                    <Nav>
                        {!currentUser && (<>
                            <NavItem>
                                <Link to="login" className='nav-link'>
                                    Login
                                </Link>
                            </NavItem>
                            <Link to="register" className='nav-link'>
                                Sign Up
                            </Link>
                        </>)}
                        {currentUser && (<>
                            <NavItem>
                                <Link to="player-info" className='nav-link'>
                                    Stats
                                </Link>
                            </NavItem>
                            <NavItem>
                                <Button onClick={logout}
                                        type='button'
                                        className="nav-link"
                                        id="nav-btn"
                                        > Logout </Button>
                            </NavItem>
                        </>)}
                    </Nav>
                </Collapse>
            </Navbar>
        </header>
        <main>
            <Outlet />
            {(currentUser) ? <Game currentUser={currentUser} /> : <Game />}
        </main>
    </>)
};

export default HomePage;
