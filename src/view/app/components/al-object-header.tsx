/* eslint-disable @typescript-eslint/naming-convention */
import * as React from 'react';
import { Link } from 'react-router-dom';
import { IALObject } from '../@types/al';
import { BackButton } from './back-button';
import '../styles/al-object-header.scss';

export const ALObjectHeader: React.FC<{ alObject: IALObject }> = ({ alObject }) => {

    return (
        
        <div className="al-object-header">
            <Link to="/">
                <div className="back-button">
                    <BackButton />
                </div>
            </Link>
            <div className="id">
                <h3>{alObject.id}</h3>
            </div>
            <div className="name">
                <h2>{alObject.name}</h2>
            </div>
        </div>
    );
};