//-----------------------------------------------
// CONFIG
//-----------------------------------------------
const WEBHOOK_URL = "http://localhost:5678/webhook/Edumate-Bot";

//-----------------------------------------------
// ELEMENTS
//-----------------------------------------------
const messagesContainer = document.getElementById("messagesContainer");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

//-----------------------------------------------
// CLOSE CHAT BUTTON
//-----------------------------------------------
function closeChat() {
    const frame = window.parent.document.getElementById("chatWidget");
    frame.style.display = "none";
}

//-----------------------------------------------
// SEND MESSAGE
//-----------------------------------------------
sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

//-----------------------------------------------
// ADD MESSAGE TO UI
//-----------------------------------------------
function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className = `message ${sender === "user" ? "user-message" : "bot-message"}`;

    const box = document.createElement("div");
    box.className = "msg-box";

    // Allow line breaks
    box.innerHTML = text.replace(/\n/g, "<br>");

    row.appendChild(box);
    messagesContainer.appendChild(row);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

//-----------------------------------------------
// SEND LOGIC
//-----------------------------------------------
function sendMessage() {
    const msg = messageInput.value.trim();
    if (!msg) return;

    addMessage(msg, "user");
    messageInput.value = "";

    fetchWebhook(msg);
}

//-----------------------------------------------
// FETCH FROM N8N (THE FIXED PART)
//-----------------------------------------------
async function fetchWebhook(userMsg) {
    try {
        const res = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: userMsg,
                timestamp: new Date().toISOString(),
                source: "web-chatbot"
            })
        });

        const data = await res.json();
        console.log("Webhook response →", data);

        let reply = "";

        // 1️⃣ EXACT MATCH FOR YOUR DATA:
        if (data.response) {
            reply = data.response;

        // 2️⃣ If array format:
        } else if (Array.isArray(data) && data[0]) {
            reply =
                data[0].response ||
                data[0].message ||
                data[0].text ||
                data[0].reply ||
                JSON.stringify(data[0]);

        // 3️⃣ Fallback:
        } else {
            reply =
                data.message ||
                data.text ||
                data.reply ||
                JSON.stringify(data);
        }

        addMessage(reply, "bot");

    } catch (err) {
        console.error(err);
        addMessage("⚠️ Backend not reachable. Check n8n server.", "bot");
    }
}
