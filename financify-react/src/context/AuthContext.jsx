import { createContext, useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext ();
//abhi its empty  storage box [   ]

function AuthProvider({children}){
    // children is smthing that is automatically pased 
    const [user,setUser]=useState(null);
    useEffect(()=>{
        // start listening 
        const unsubscirbe = onAuthStateChanged(auth,(currentUser)=>{
            setUser(currentUser);
        });
        return ()=>{ 
            unsubscirbe();
        };
    },[]
);
    return(
        <AuthContext.Provider value={{user}}> 
        {/* value ={{}} later becomes user,setuser */}
            {/* provider helps to fill the context with data  */}
            {children}
        </AuthContext.Provider>
    )
}
export {AuthContext,AuthProvider}
// autoContext stores authentication data
// auto provider wraps the application 
