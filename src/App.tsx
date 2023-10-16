import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageModel,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  AgentExecutor,
  initializeAgentExecutorWithOptions,
} from "langchain/agents";
import { useCallback, useEffect, useState } from "react";

const model = new ChatOpenAI({
  openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

function App() {
  const [executor, setExecutor] = useState<AgentExecutor>();
  const [messages, setMessages] = useState<MessageModel[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [value, setValue] = useState<string>("");

  const handleMount = useCallback(async () => {
    const initExecutor = await initializeAgentExecutorWithOptions([], model, {
      agentType: "chat-conversational-react-description",
      verbose: true,
    });
    setMessages((prevState) => [
      ...prevState,
      {
        message: "Ready to answer your questions",
        sentTime: new Date().toLocaleTimeString(),
        sender: "ChatGPT",
        direction: "incoming",
        position: "single",
      },
    ]);
    setExecutor(initExecutor);
    setLoading(false);
  }, []);

  useEffect(() => {
    handleMount();
  }, []);

  const handleNewMessage = async (message: string) => {
    if (!executor) return;
    setValue("");
    setLoading(true);
    setMessages((prevState) => [
      ...prevState,
      {
        message: message,
        sentTime: new Date().toLocaleTimeString(),
        sender: "User",
        direction: "outgoing",
        position: "single",
      },
    ]);
    const response = await executor.call({ input: message });
    setMessages((prevState) => [
      ...prevState,
      {
        message: response.output,
        sentTime: new Date().toLocaleTimeString(),
        sender: "ChatGPT",
        direction: "incoming",
        position: "single",
      },
    ]);
    setLoading(false);
  };

  return (
    <div style={{ position: "relative", height: "500px" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messages.map((message, index) => (
              <Message key={index} model={message} />
            ))}
            {isLoading ? <TypingIndicator /> : null}
          </MessageList>
          <MessageInput
            value={value}
            onChange={(e) => setValue(e)}
            disabled={isLoading}
            placeholder="Type message here"
            onSend={handleNewMessage}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
}

export default App;
