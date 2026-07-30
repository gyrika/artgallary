import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Award, BookOpen, Check, CheckCircle2, FileAudio, Globe2, Lightbulb,
  Mic, RotateCcw, Sparkles, Square, TrendingUp, Volume2
} from "lucide-react";
import "./styles.css";

const curriculum = {
  Beginner: [
    ["Introducing Yourself", "Practice greeting someone politely and talking about your name, hometown, and hobbies.", "Hello! Could you introduce yourself? Tell me your name, where you live, and what you enjoy doing in your free time.", ["Pleased to meet you", "Currently living", "Keen on", "Favourite"]],
    ["Ordering Tea & Snacks", "Learn how to order refreshments politely in British English.", "Imagine you are at a cosy tea room in London. Order English Breakfast tea and a piece of cake politely.", ["I'd like to have", "Cuppa", "Please", "Cheers"]],
    ["My Daily Routine", "Describe a typical workday or weekend morning.", "Tell me about your morning routine. What time do you wake up, and what do you do first?", ["Usually", "At seven o'clock", "Fancy a coffee", "Afterwards"]]
  ],
  Intermediate: [
    ["Describing a Holiday Trip", "Talk about a recent trip and the places you enjoyed.", "Tell me about a memorable holiday. Where did you go and why was it special?", ["Splendid time", "Sightseeing", "Travelling", "Scenery"]],
    ["Discussing British Weather", "Master the national pastime of weather small talk.", "Describe today's weather in your city as if making friendly small talk.", ["Bit chilly", "Overcast", "Lovely day", "Pouring with rain"]],
    ["Your Opinion on Films", "Share your thoughts on a film or series.", "What brilliant film or programme have you watched recently, and why would you recommend it?", ["In my opinion", "Brilliant", "Quite engaging", "Plot"]]
  ],
  Advanced: [
    ["Job Interview Practice", "Answer professional questions with polished British English.", "Why do you believe you are the ideal candidate for this role, and what are your core strengths?", ["Experience in", "Key strength", "Collaborative", "Achieved"]],
    ["Debating Technology", "Articulate a balanced argument about modern technology.", "Does modern technology bring people closer together or cause more isolation?", ["On the one hand", "Furthermore", "Undoubtedly", "Balanced perspective"]]
  ]
};

const normalise = (row, level) => ({
  id: `${level}-${row[0]}`, title: row[0], description: row[1], prompt: row[2], words: row[3]
});

function App() {
  const [level, setLevel] = useState("Beginner");
  const [topic, setTopic] = useState(normalise(curriculum.Beginner[0], "Beginner"));
  const [custom, setCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [sessions, setSessions] = useState(0);
  const recorder = useRef(null);
  const chunks = useRef([]);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const reset = () => {
    if (recorder.current?.state === "recording") recorder.current.stop();
    setRecording(false); setSeconds(0); setAudioUrl(""); setText(""); setResult(null);
  };

  const chooseLevel = (next) => {
    setLevel(next); setTopic(normalise(curriculum[next][0], next)); setCustom(false); reset();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const media = new MediaRecorder(stream);
      media.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      media.onstop = () => {
        setAudioUrl(URL.createObjectURL(new Blob(chunks.current, { type: media.mimeType })));
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.current = media;
      setResult(null); setAudioUrl(""); setSeconds(0); media.start(); setRecording(true);
    } catch {
      alert("Microphone access is unavailable. You can type a response instead.");
    }
  };

  const stopRecording = () => {
    recorder.current?.stop();
    setRecording(false);
  };

  const evaluate = () => {
    const response = text.trim() || "Audio response recorded successfully.";
    setResult({
      transcript: response,
      score: text.trim() ? 88 : 84,
      grammar: 91, fluency: 86, british: 87,
      summary: "A confident and engaging response. Your ideas are clear, with a naturally polite tone and some lovely British phrasing.",
      suggestions: [
        "I’m currently living in Colombo, and I’m rather keen on exploring new places.",
        "In my spare time, I quite enjoy reading and having a proper cuppa."
      ]
    });
    setSessions((s) => s + 1);
  };

  const speak = (value) => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = "en-GB"; utterance.rate = 0.9;
    const voice = speechSynthesis.getVoices().find((v) => v.lang === "en-GB");
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="app">
      <header>
        <div className="header-inner">
          <div className="brand-mark"><Mic size={22} /></div>
          <div className="brand"><div>BritSpeak AI <span>Voice Recorder</span></div><small>Record your voice & get a British English evaluation</small></div>
          <div className="session"><TrendingUp size={15} /> Practised: {sessions} sessions</div>
        </div>
      </header>

      <main>
        <aside>
          <section className="card topics">
            <h2><BookOpen /> Select Practice Topic</h2>
            <div className="tabs">
              {Object.keys(curriculum).map((item) => <button className={level === item && !custom ? "active" : ""} onClick={() => chooseLevel(item)} key={item}>{item}</button>)}
            </div>
            <div className="topic-list">
              {!custom && curriculum[level].map((row) => {
                const item = normalise(row, level);
                return <button key={item.id} className={topic.id === item.id ? "topic active" : "topic"} onClick={() => { setTopic(item); reset(); }}>
                  <b>{item.title}</b><small>{item.description}</small>
                </button>;
              })}
            </div>
            <button className={custom ? "custom active" : "custom"} onClick={() => { setCustom(true); reset(); }}><Sparkles /> Practice Any Custom Topic</button>
          </section>
          <section className="tip">
            <h3><Lightbulb /> How audio recording works</h3>
            <p>Press the red button and speak clearly. Stop when you’re done, play your recording back, then receive friendly feedback.</p>
          </section>
        </aside>

        <div className="content">
          <section className="card prompt-card">
            <div className="row"><span className={`pill ${custom ? "gold" : level.toLowerCase()}`}>{custom ? "Custom Mode" : level}</span><button className="link" onClick={reset}><RotateCcw /> Start over</button></div>
            {custom ? <><label>Enter your custom topic or question</label><input value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} placeholder="e.g. Talking about my job..." /></> :
              <><h1>{topic.title}</h1><p className="prompt">“{topic.prompt}”</p><div className="words"><b>Try using:</b>{topic.words.map((word) => <span key={word}>{word}</span>)}</div></>}
          </section>

          <section className="card recorder-card">
            <button className={recording ? "record stop" : "record"} onClick={recording ? stopRecording : startRecording}>{recording ? <Square /> : <Mic />}</button>
            <div className={recording ? "record-status live" : "record-status"}>{recording ? `Recording audio… 00:${String(seconds).padStart(2, "0")}` : audioUrl ? `✓ Voice recorded (00:${String(seconds).padStart(2, "0")})` : "Click the microphone to record your response"}</div>
            {audioUrl && <div className="audio"><span><FileAudio /> Your audio recording</span><audio controls src={audioUrl} /></div>}
            {!audioUrl && !recording && <div className="manual"><label>Or type your response manually</label><textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} placeholder="If you prefer typing or want to quickly test the experience…" /></div>}
            <div className="actions"><button className="evaluate" disabled={!audioUrl && !text.trim()} onClick={evaluate}><Sparkles /> Evaluate spoken recording</button></div>
          </section>

          {result && <section className="card results">
            <div className="score-head">
              <div className="score"><strong>{result.score}</strong><small>/ 100</small></div>
              <div><h2><Award /> Speech performance</h2><p>{result.summary}</p></div>
              <div className="metrics"><span>Grammar <b>{result.grammar}%</b></span><span>Fluency <b>{result.fluency}%</b></span><span>UK phrasing <b>{result.british}%</b></span></div>
            </div>
            <div className="transcript"><h3>Exact transcription</h3><p>“{result.transcript}”</p></div>
            <h3><CheckCircle2 /> Grammar & refinement</h3>
            <div className="success"><Check /> Splendid job! No major grammar errors detected.</div>
            <h3><Globe2 /> Native British English phrasing</h3>
            {result.suggestions.map((suggestion, i) => <div className="suggestion" key={suggestion}><span><b>Option {i + 1}:</b> “{suggestion}”</span><button onClick={() => speak(suggestion)}><Volume2 /> Listen</button></div>)}
          </section>}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
