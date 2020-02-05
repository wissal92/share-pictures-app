import React, {useEffect, useState} from 'react';
import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {useHttpClient} from '../../shared/hooks/http-hook';

const User = () =>{
   const {isLoading, error, sendRequest, clearError} = useHttpClient();
   const [loadedUsers, setLoadedUsers] = useState();

   useEffect(() => {
       const fetchUsers = async () => {
           try{
                const resData = await sendRequest('http://localhost:5000/api/users/');
                setLoadedUsers(resData.users);

           } catch(err) {}
       };
      fetchUsers();
   },[sendRequest]);

   return (
       <>
          <ErrorModal error={error} onClear={clearError} />
           {isLoading && <div className="center"><LoadingSpinner /></div>}
          {!isLoading && loadedUsers && <UsersList items={loadedUsers}/>}
       </>
   )
}

export default User;