import React from 'react';
import { render} from '@testing-library/react';
import Game from './Game';

describe('Game component', function(){
    const mockUser = {username: 'testUser'};

    it('renders without crashing without user', function () {
        render(<Game currentUser={null} />);
    });

    it('renders without crashing without user', function () {
        render(<Game currentUser={mockUser} />);
    });
})
