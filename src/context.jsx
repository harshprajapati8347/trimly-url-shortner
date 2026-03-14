/* eslint-disable react/prop-types */

import {createContext, useContext, useEffect, useState} from "react";
import {getCurrentUser} from "./db/apiAuth";
import useFetch from "./hooks/use-fetch";

const UrlContext = createContext();

const UrlProvider = ({children}) => {
  const {data: user, loading, fn: fetchUser} = useFetch(getCurrentUser);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const guestState = localStorage.getItem("trimly_guest_session") === "true";
    setIsGuest(guestState);
    fetchUser();
  }, []);

  const setGuestSession = (state) => {
    setIsGuest(state);
    localStorage.setItem("trimly_guest_session", String(state));
  };

  const isAuthenticated = user?.role === "authenticated" || isGuest;

  return (
    <UrlContext.Provider value={{user, fetchUser, loading, isAuthenticated, isGuest, setGuestSession}}>
      {children}
    </UrlContext.Provider>
  );
};

export const UrlState = () => {
  return useContext(UrlContext);
};

export default UrlProvider;
