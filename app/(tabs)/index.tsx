import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { WebView } from "react-native-webview";

const SpeechToTextComponent = () => {
  const [spokenText, setSpokenText] = useState("");

  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            background-color: #f4f4f4;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          button {
            padding: 12px 20px;
            font-size: 16px;
            margin: 10px;
            border: none;
            cursor: pointer;
            border-radius: 8px;
            transition: 0.3s;
          }
          #startBtn {
            background-color: #4caf50;
            color: white;
          }
          #stopBtn {
            background-color: #f44336;
            color: white;
          }
          button:hover {
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <h2>Speech to Text</h2>
        <button id="startBtn" onclick="startListening()">Start Speaking</button>
        <button id="stopBtn" onclick="stopListening()">Stop</button>
        <p id="outputText"></p>

        <script>
          const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.continuous = true;
          recognition.interimResults = false;
          recognition.lang = 'en-US';

          recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            document.getElementById('outputText').innerText = "Recognized: " + transcript;
            window.ReactNativeWebView.postMessage(transcript);
          };

          function startListening() {
            recognition.start();
          }

          function stopListening() {
            recognition.stop();
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={(event) => {
          setSpokenText(event.nativeEvent.data);
          sendToBackend(event.nativeEvent.data);
        }}
      />
      <Text style={{ padding: 20, fontSize: 18 }}>Recognized Text: {spokenText}</Text>
    </View>
  );
};

// Send text to Flask backend
const sendToBackend = async (text) => {
  try {
    const response = await fetch("http://172.16.45.67:5000/api/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    console.log("Response from backend:", data);
  } catch (error) {
    console.error("Error sending speech text to backend:", error);
  }
};

export default SpeechToTextComponent;
