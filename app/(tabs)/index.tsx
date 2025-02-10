import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import * as Speech from "expo-speech";

const SpeechApp = () => {
  const [spokenText, setSpokenText] = useState("");
  const [apiText, setApiText] = useState("");
  const [loading, setLoading] = useState(true);

  // HTML for WebView speech recognition
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

  // Fetch initial text from API
  useEffect(() => {
    const fetchText = async () => {
      try {
        const response = await fetch("http://172.16.45.67:5000/api/text");
        const data = await response.json();
        setApiText(data.message);
      } catch (error) {
        console.error("Error fetching text:", error);
        setApiText("Failed to fetch text.");
      } finally {
        setLoading(false);
      }
    };
    fetchText();
  }, []);

  // Send speech text to backend
  const sendToBackend = async (text : string) => {
    try {
      const response = await fetch("http://172.16.45.67:5000/api/speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }
      const data = await response.json();
      console.log("Backend response:", data);

      // Backend response is done and now Rohit will add the ml response 
      
      const textResponse = await fetch("http://172.16.45.67:5000/api/text");
      const textData = await textResponse.json();
      
      // 3. Update state and speak
      setApiText(textData.message);
      Speech.speak(textData.message, { language: "en-US", pitch: 1.2, rate: 1.0 });
    } catch (error) {
      console.error("Error sending to backend:", error);
    }
  };

  // Speak API text
  const speakApiText = () => {
    if (apiText) {
      Speech.speak(apiText, { language: "en-US", pitch: 1.2, rate: 1.0 });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Speech to Text Section */}
      <View style={{ height: 300 }}>
        <WebView
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={(event) => {
            setSpokenText(event.nativeEvent.data);
            sendToBackend(event.nativeEvent.data);
          }}
        />
      </View>
      <Text style={{ padding: 15, fontSize: 16 }}>
        Recognized: {spokenText}
      </Text>

      {/* Text to Speech Section */}
      <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#ccc' }}>
        {loading ? (
          <ActivityIndicator size="large" color="blue" />
        ) : (
          <>
            <Text style={{ fontSize: 16, marginBottom: 15 }}>
              API Message: {apiText}
            </Text>
            <Button
              title="Speak API Message"
              onPress={speakApiText}
              color="#2196F3"
            />
          </>
        )}
      </View>
    </View>
  );
};

export default SpeechApp;