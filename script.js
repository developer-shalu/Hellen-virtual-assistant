const btn = document.querySelector("#btn");
const content = document.querySelector("#content");
const statusText = document.querySelector("#status");
const voice = document.querySelector("#voice");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

const supportedSites = [
    { trigger: "youtube", url: "https://www.youtube.com/" },
    { trigger: "facebook", url: "https://www.facebook.com/" },
    { trigger: "google", url: "https://www.google.com/" },
    { trigger: "instagram", url: "https://www.instagram.com/" },
    { trigger: "github", url: "https://www.github.com/" },
    { trigger: "linkedin", url: "https://www.linkedin.com/" }
];

function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
}

function setListeningState(isListening) {
    btn.style.display = isListening ? "none" : "flex";
    voice.style.display = isListening ? "block" : "none";
}

function wish() {
    const hours = new Date().getHours();

    if (hours < 12) {
        speak("Good morning!");
        return;
    }

    if (hours < 17) {
        speak("Good afternoon!");
        return;
    }

    speak("Good evening!");
}

function searchWeb(query) {
    const cleanedQuery = query.trim();
    const spokenQuery = cleanedQuery || "your request";
    speak(`This is what I found on the internet regarding ${spokenQuery}.`);
    window.open(`https://www.google.com/search?q=${encodeURIComponent(cleanedQuery)}`, "_blank", "noopener");
}

function openSite(siteName) {
    const site = supportedSites.find((item) => item.trigger === siteName);

    if (!site) {
        searchWeb(siteName);
        return;
    }

    speak(`Opening ${site.trigger}.`);
    window.open(site.url, "_blank", "noopener");
}

function takeCommand(message) {
    setListeningState(false);
    statusText.innerText = `You said: "${message}"`;

    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
        speak("Hello! What can I help you with?");
        return;
    }

    if (message.includes("who are you")) {
        speak("I am Hellen, your virtual assistant.");
        return;
    }

    if (message.includes("your name")) {
        speak("My name is Hellen.");
        return;
    }

    if (message.includes("time")) {
        const currentTime = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
        speak(`The time is ${currentTime}.`);
        return;
    }

    if (message.includes("date") || message.includes("today")) {
        const today = new Date().toLocaleDateString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
        speak(`Today is ${today}.`);
        return;
    }

    const openMatch = message.match(/open\s+(.+)/);
    if (openMatch) {
        openSite(openMatch[1].trim());
        return;
    }

    const searchMatch = message.match(/search\s+(.+)/);
    if (searchMatch) {
        searchWeb(searchMatch[1]);
        return;
    }

    searchWeb(message.replace(/hellen/gi, "").trim());
}

window.addEventListener("load", () => {
    if (!recognition) {
        statusText.innerText = "Speech recognition is not supported in this browser. Please use Chrome on desktop or Android.";
        btn.disabled = true;
        content.innerText = "Speech recognition not supported";
        return;
    }

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    wish();
});

if (recognition) {
    recognition.onstart = () => {
        setListeningState(true);
        statusText.innerText = "Listening...";
        content.innerText = "Listening...";
    };

    recognition.onresult = (event) => {
        const currentIndex = event.resultIndex;
        const transcript = event.results[currentIndex][0].transcript.trim();
        content.innerText = transcript;
        takeCommand(transcript.toLowerCase());
    };

    recognition.onerror = (event) => {
        setListeningState(false);
        statusText.innerText = `Voice recognition error: ${event.error}`;
        content.innerText = "Click here to talk to me";
        speak("I could not hear you clearly. Please try again.");
    };

    recognition.onend = () => {
        setListeningState(false);
        if (content.innerText === "Listening...") {
            content.innerText = "Click here to talk to me";
        }
    };

    btn.addEventListener("click", () => {
        statusText.innerText = "Starting microphone...";
        recognition.start();
    });
}
