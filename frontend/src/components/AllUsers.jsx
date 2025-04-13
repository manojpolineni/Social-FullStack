import {useContext} from 'react'
import AuthContext from '../context/AuthContext'

const AllUsers = () => {
      const { user } = useContext(AuthContext);
      // console.log("all", user);

      const url = 'http://localhost:9999'
      const profile = url+ user?.profilePic

  return (
    <div className="flex justify-between items-center ">
      {user?.length>0 &&
        user.map((users, index) => {
          <div className="flex flex-col justify-center items-center " key={index}>
            <img
              src={profile}
              alt={user?.userName}
              className="w-50  h-50 rounded-b-full p-2 border-1 border-gray-600"
            />
            <p className='text-lg font-medium '>{users?.userName}</p>
          </div>
      })}
    </div>
  );
}

export default AllUsers