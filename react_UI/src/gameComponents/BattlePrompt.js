import React, { useState } from "react";
import { Container, Input, Button, Form, FormGroup, Label, Col } from "reactstrap";
import "../forms/Forms.css";
import "./BattlePrompt.css";

function BattlePrompt({battle, deck, draw}){
    const [drawAmt, setDrawAmt] = useState(1);
    const [errors, setErrors] = useState(null);

    const handleChange = (evt) => {
        setDrawAmt(Number(evt.target.value));
    };

    function handleSubmit(evt){
        evt.preventDefault();

        if(deck.p1.length <= 1 || deck.p2.length <= 1) {
            setErrors("Not enough cards. Hit battle to continue.");
            return draw();
        }
        if (drawAmt < 1) {
            setErrors("Don't be afraid! At least risk one card.");
            return setDrawAmt(1);
        }
        else if (drawAmt > 6) {
            setErrors("Whoa tiger! Lets cap it at 6 cards.");
            return setDrawAmt(6);
        };
        // if either player's remaining cards are <= than drawAmt, battle with the fewest remaining cards - 1
        if (deck.p1.length <= drawAmt || deck.p2.length <= drawAmt) {
            if (deck.p1.length <= drawAmt && deck.p1.length <= deck.p2.length) {
                setErrors(`You don't have enough cards for that. Try ${deck.p1.length - 1}`)
                return setDrawAmt(deck.p1.length - 1);
            }
            else if (deck.p2.length <= drawAmt){
                setErrors(`Your opponent doesn't have enough cards for that. Try ${deck.p2.length - 1}`)
                return setDrawAmt(deck.p2.length - 1)
            };
        }
        battle(drawAmt);
    };

    return(
        <Container fluid='sm' className="w-50 bg-light border Battle-prompt">
            <Form onSubmit={handleSubmit}>

                <h3 className="Form-header">
                    How many cards would you like to risk in this battle?
                </h3>

                {errors && <p className="Form-error">{errors}</p>}

                <FormGroup row>
                    <Col lg={3} md={3} xs={12}>
                        <Label htmlFor="draw" size="lg"> Cards </Label>
                    </Col>
                    <Col lg={6} md={6} sm={12}>
                        <Input  id="draw"
                                type="number"
                                name="draw"
                                bsSize="sm"
                                value={drawAmt}
                                onChange={handleChange} />
                    </Col>
                    <Col lg={3} md={2} xs={12}>
                        <Button variant='success'> Battle </Button>
                    </Col>
                </FormGroup>
            </Form>
        </Container>
    );
};

export default BattlePrompt;
