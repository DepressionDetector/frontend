import React, { createContext, useState, ReactNode, useEffect } from "react";
import { ConfigProvider } from "antd";
import {
  getLocalStoragedata,
  setLocalStorageData,
} from "../helpers/Storage";
import { getCurrentTime } from "../helpers/Time";

export interface Message {
  sender: string;
  text: string;
  time: string;
}
interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  sessionID: string;
  setSessionID: (id: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  chatHistory: Message[];
  setChatHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  isSessionEnded: boolean;
  setIsSessionEnded: (ended: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  sessionID: "",
  setSessionID: () => {},
  messages: [],
  setMessages: () => {},
  chatHistory: [],
  setChatHistory: () => {},
  isSessionEnded: false,
  setIsSessionEnded: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthContextProvider({ children }: AuthProviderProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromURL = urlParams.get("token");
  const storedToken = getLocalStoragedata("token");
  const initialToken = tokenFromURL || storedToken;

  const [token, setToken] = useState<string | null>(initialToken);
  const [sessionID, setSessionID] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "popo",
      text: "Hi there. How are you feeling today?",
      time: getCurrentTime(),
    },
  ]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  useEffect(() => {
    if (tokenFromURL) {
      setLocalStorageData("token", tokenFromURL);
      const cleanURL = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanURL);
    }
  }, [tokenFromURL]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        sessionID,
        setSessionID,
        messages,
        setMessages,
        chatHistory,
        setChatHistory,
        isSessionEnded,
        setIsSessionEnded,
      }}
    >
      <ConfigProvider
        theme={{
          components: {
            Notification: {
              paddingMD: 15,
              colorIcon: "rgb(255, 255, 255)",
              colorTextHeading: "rgba(254, 254, 254, 0.88)",
              colorIconHover: "rgb(255, 255, 255)",
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AuthContext.Provider>
  );
}
