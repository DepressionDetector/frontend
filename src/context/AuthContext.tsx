import React, { createContext, useState, ReactNode } from "react";
import { ConfigProvider } from "antd";
import { getCurrentTime } from "../helpers/Time";

export interface Message {
  sender: string;
  text: string;
  time: string;
}

interface AuthContextType {
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
  const [sessionID, setSessionID] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "popo",
      text: "Hello. How may I assist you today?",
      time: getCurrentTime(),
    },
  ]);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isSessionEnded, setIsSessionEnded] = useState(false);

  return (
    <AuthContext.Provider
      value={{
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
