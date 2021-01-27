import React, { useState, useEffect, useRef } from 'react';
import { animateScroll } from "react-scroll";
import './App.css';
import CHAT_API from "./api/ChatAPI";
import CC_LOGO from "./images/cc_flat.png";


function App() {
  
  const [voiceSynth, selectedVoiceSynth] = useState(window.speechSynthesis);

  /* The text-to-speech voices available */
  const [speechVoices, setSpeechVoices] = useState([]);

  /* The current selected voice */
  const [selectedVoice, setSelectedVoice] = useState();

  /* Flag to indicate if user is currently speaking */
  const [isSpeaking, setIsSpeaking] = useState(false);

  /* Ref to the recongnition object */
  const recognition = useRef(null);

  /* A list of recieved/sent messages */
  const [messagesList, setMessagesList] = useState([]);

  /* Flag to indicate waiting for response */
  const [waitingForResponse, setWaitingForResponse] = useState(false);

  /* Flag to show modal */
  const [showInfoModal, setShowInfoModal] = useState(false);

  /* On init */
  useEffect(() => {
    const voices = voiceSynth.getVoices();

    /* Setup speech recognition */
    recognition.current = new window.webkitSpeechRecognition();
    recognition.current.continous = true;
    // recognition.current.interimResults = true;
    recognition.current.lang = 'en-US';
    recognition.current.onstart = onRecognitionStart;
    recognition.current.onspeechend = onSpeechEnd;
    recognition.current.onresult = onRecognitionResult;

    setSpeechVoices(voices);
    setSelectedVoice("Google UK English Male")
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      recognition.current.start();
    } else {
      recognition.current.stop();
    }
  }, [isSpeaking]);
  
  const getVoices = () => {
    return speechVoices.map(voice => {
      console.log(voice);

      return (
        <option key={voice.name} value={voice.name}>
          {voice.name}
        </option>
      );
    })
  };
  
  /* Scroll to bottom of when new message recieved */
  useEffect(() => {
    animateScroll.scrollToBottom({
      containerId: "messageContainer",
      duration: 200,
      delay: 0
    })
  }, [messagesList]);

  const onVoiceStart = () => {
    setIsSpeaking(!isSpeaking);
  };

  const onRecognitionStart = () => {
    console.log("Listening to voice...")
  };

  const onSpeechEnd = () => {
    console.log("Stopped listening to voice");
    setIsSpeaking(false);
  };

  const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  };

  const onRecognitionResult = (event) => {
    console.log("Transcript: ", event.results[0][0].transcript);

    /* Push the transcribed message to the list */
    const message = {
      type: "sent",
      text: capitalize(event.results[0][0].transcript) + "."
    };

    setWaitingForResponse(true);
  
    CHAT_API.getReply(message.text)
      .then((response) => {
        const botResponse = {
          type: "recieved",
          text: response.output
        }
        
        const utterThis = new SpeechSynthesisUtterance(botResponse.text);
        const voice = speechVoices.find(el => 
          el.name === selectedVoice
        );


        utterThis.voice = voice;
        voiceSynth.speak(utterThis);

        utterThis.onend = () => {
          setIsSpeaking(true);
          setWaitingForResponse(false);
        }
       
        setMessagesList(oldMessages => [...oldMessages, botResponse]);
      });

    setIsSpeaking(false);
    setMessagesList(oldMessages => [...oldMessages, message]);
  };

  const renderMessagesList = () => {
    return messagesList.map((message) => {
      
      if (message.type === "sent") {
        return (
          <li className="message-list-message-container">
            <p className="user-message-label">You said:</p>
            <p className="message-text">{message.text}</p>
          </li>
        );
      }

      if (message.type === "recieved") {
        return (
          <li className="message-list-message-container">
            <p className="bot-message-label">Your bud said:</p>
            <p className="message-text">{message.text}</p>
          </li>
        )
      }
      
      return null;
    });
  };

  return (
    <div className="App">
      {
        showInfoModal && (
          <div className="info-modal-container">
            <div className="info-modal">
              <h1>Buddy Talk</h1>
              <p>Made possible by generous grants by the Coding Cougs.</p>
              <img className="cc-logo-inner" id="rotating" src={CC_LOGO} alt="Coding Cougs logo" />
              <p>Created by Valentin Molina.</p>

              <button onClick={() => setShowInfoModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div> 
        )
      }
      <main className="text-box-container">
        {
          messagesList.length === 0 ? (
            <div className="empty-list-container">
              Start talking to your buddy by clicking the button below.
            </div>
          ) : (
            <ul id="messageContainer" className="message-box">
              {renderMessagesList()}
            </ul>
          )
        }
      </main>

      <div className="text-input-container">
        <div className="button-container">

          <button disabled={waitingForResponse} class={`${isSpeaking ? "active" : ""}`} onClick={onVoiceStart} id="getVoiceInputBtn">
            { isSpeaking ? "Listening... click to stop" : "Click to start speaking" }
          </button>

          <img class="cc-logo" onClick={() => setShowInfoModal(true)} src={CC_LOGO} alt="Coding Cougs logo" />
        </div>
      </div>
    </div>
  );
}



export default App;
