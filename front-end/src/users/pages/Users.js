import React from 'react';
import UsersList from '../components/UsersList'

const User = () =>{
    const USERS = [
        {
            id: 'u1',
            name: 'wissal bel',
            image: 'http://www.krugerpark.co.za/images/1-lion-charge-gc590a.jpg',
            places: 3
        }
    ]
   return <UsersList items={USERS}/>
}

export default User;