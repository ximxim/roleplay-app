import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  AgentExecutor,
  initializeAgentExecutorWithOptions,
} from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  SystemMessage,
} from "langchain/schema";
import { useCallback, useEffect, useState } from "react";

const model = new ChatOpenAI({
  openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

/**
 * Got prompts from here: https://github.com/f/awesome-chatgpt-prompts
 */

const prompts = {
  "Linux Terminal": `
  I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. When I need to tell you something in English, I will do so by putting text inside curly brackets {like this}. My first command is pwd
  `,
  "English Translator and Improver": `
  I want you to act as a linux terminal. I will type commands and you will reply with what the terminal should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. When I need to tell you something in English, I will do so by putting text inside curly brackets {like this}. My first command is pwd
  `,
  "React Interviewer": `
  I want you to act as an interviewer. I will be the candidate and you will ask me the interview questions for the react position. I want you to only reply as the interviewer. Do not write all the conservation at once. I want you to only do the interview with me. Ask me the questions and wait for my answers. Do not write explanations. Ask me the questions one by one like an interviewer does and wait for my answers. My first sentence is "Hi"
  `,
  "JavaScript Console": `
  I want you to act as a javascript console. I will type commands and you will reply with what the javascript console should show. I want you to only reply with the terminal output inside one unique code block, and nothing else. do not write explanations. do not type commands unless I instruct you to do so. when I need to tell you something in english, I will do so by putting text inside curly brackets {like this}. My first command is console.log("Hello World");
  `,
  "Excel Sheet": `
  I want you to act as a text based excel. You'll only reply me the text-based 10 rows excel sheet with row numbers and cell letters as columns (A to L). First column header should be empty to reference row number. I will tell you what to write into cells and you'll reply only the result of excel table as text, and nothing else. Do not write explanations. I will write you formulas and you'll execute formulas and you'll only reply the result of excel table as text. First, reply me the empty sheet.
  `,
  "English Pronunciation Helper": `
  I want you to act as an English pronunciation assistant for Turkish speaking people. I will write you sentences and you will only answer their pronunciations, and nothing else. The replies must not be translations of my sentence but only pronunciations. Pronunciations should use Turkish Latin letters for phonetics. Do not write explanations on replies. My first sentence is "how the weather is in Istanbul?"
  `,
  "Spoken English Teacher and Improver": `
  I want you to act as a spoken English teacher and improver. I will speak to you in English and you will reply to me in English to practice my spoken English. I want you to keep your reply neat, limiting the reply to 100 words. I want you to strictly correct my grammar mistakes, typos, and factual errors. I want you to ask me a question in your reply. Now let's start practicing, you could ask me a question first. Remember, I want you to strictly correct my grammar mistakes, typos, and factual errors.
  `,
  "Travel Guide": `
  I want you to act as a travel guide. I will write you my location and you will suggest a place to visit near my location. In some cases, I will also give you the type of places I will visit. You will also suggest me places of similar type that are close to my first location. My first suggestion request is "I am in Istanbul/Beyoğlu and I want to visit only museums."
  `,
  "Plagiarism Checker": `
  I want you to act as a plagiarism checker. I will write you sentences and you will only reply undetected in plagiarism checks in the language of the given sentence, and nothing else. Do not write explanations on replies. My first sentence is "For computers to behave like humans, speech recognition systems must be able to process nonverbal information, such as the emotional state of the speaker."
  `,
  "Harry Potter": `
  I want you to act like Harry Potter from Harry Potter Series. I want you to respond and answer like Harry Potter using the tone, manner and vocabulary Harry Potter would use. Do not write any explanations. Only answer like Harry Potter. You must know all of the knowledge of Harry Potter. My first sentence is "Hi Harry Potter."
  `,
  Advertiser: `
  I want you to act as an advertiser. You will create a campaign to promote a product or service of your choice. You will choose a target audience, develop key messages and slogans, select the media channels for promotion, and decide on any additional activities needed to reach your goals. My first suggestion request is "I need help creating an advertising campaign for a new type of energy drink targeting young adults aged 18-30."
  `,
  Storyteller: `
  I want you to act as a storyteller. You will come up with entertaining stories that are engaging, imaginative and captivating for the audience. It can be fairy tales, educational stories or any other type of stories which has the potential to capture people's attention and imagination. Depending on the target audience, you may choose specific themes or topics for your storytelling session e.g., if it’s children then you can talk about animals; If it’s adults then history-based tales might engage them better etc. My first request is "I need an interesting story on perseverance."
  `,
};

function App() {
  const [executor, setExecutor] = useState<AgentExecutor>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [value, setValue] = useState<string>("");
  const [messages, setMessages] = useState<BaseMessage[]>([]);
  const [promptType, setPromptType] =
    useState<keyof typeof prompts>("React Interviewer");

  const handleInit = useCallback(async () => {
    const initExecutor = await initializeAgentExecutorWithOptions([], model, {
      agentType: "chat-conversational-react-description",
      verbose: true,
    });
    const response = await model.generate([
      [new SystemMessage(prompts[promptType])],
    ]);
    setMessages([new AIMessage(response.generations[0][0].text)]);
    setExecutor(initExecutor);
    setIsLoading(false);
  }, [promptType]);

  useEffect(() => {
    handleInit();
  }, [promptType]);

  const handleNewMessage = async (message: string) => {
    if (!executor) return;
    setValue("");
    setIsLoading(true);
    const tmpMessages = messages;
    setMessages((prevState) => [...prevState, new HumanMessage(message)]);
    const response = await model.generate([
      [...tmpMessages, new HumanMessage(message)],
    ]);
    setMessages((prevState) => [
      ...prevState,
      new AIMessage(response.generations[0][0].text),
    ]);
    setIsLoading(false);
  };

  return (
    <div>
      <label htmlFor="character">Act as a:</label>
      <select
        value={promptType}
        name="character"
        id="character"
        onChange={(e) => setPromptType(e.target.value as any)}
      >
        {Object.keys(prompts).map((key, index) => (
          <option value={key} key={index}>
            {key}
          </option>
        ))}
      </select>
      <div style={{ position: "relative", height: "500px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList>
              {messages
                .filter((message) => message._getType() !== "system")
                .map((message, index) => (
                  <Message
                    key={index}
                    model={{
                      message: message.content,
                      direction:
                        message._getType() === "human"
                          ? "outgoing"
                          : "incoming",
                      position: "single",
                    }}
                  />
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
    </div>
  );
}

export default App;
