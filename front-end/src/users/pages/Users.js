import React, {useEffect, useState} from 'react';
import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';

const User = () =>{
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState();
   const [loadedUsers, setLoadedUsers] = useState();

   useEffect(() => {
       const sendRequest = async () => {
           setIsLoading(true);

           try{
                const res = await fetch('http://localhost:5000/api/users/');
                const resData = await res.json();

                if(!res.ok){
                    throw new Error(resData.message);
                }
                
                setLoadedUsers(resData.users);

           } catch(err) {
               setError(err.message);
           }

           setIsLoading(false);
       };
      sendRequest();
   },[]);

   const errorHandler = () => {
       setError(null);
   };

   return (
       <>
          <ErrorModal error={error} onClear={errorHandler} />
           {isLoading && <div className="center"><LoadingSpinner /></div>}
          {!isLoading && loadedUsers && <UsersList items={loadedUsers}/>}
       </>
   )
}

export default User;