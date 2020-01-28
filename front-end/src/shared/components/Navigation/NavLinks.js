import React from 'react';
import {NavLink} from 'react-router-dom';
import './NavLinks.css';

const NavLinks = props => {
    return(
       <ul className='nav-links'>
          <li>
              <NavLink exact to='/'>All Users</NavLink>
          </li>
          <li>
              <NavLink exact to='/u1/places'>My Places</NavLink>
          </li>
          <li>
              <NavLink exact to='/places/new'>Add Place</NavLink>
          </li>
          <li>
              <NavLink exact to='/auth'>Authentication</NavLink>
          </li>
       </ul>
    )
}

export default NavLinks;