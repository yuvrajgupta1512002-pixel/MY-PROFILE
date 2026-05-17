/* ========================================
   AI AGENT LOGIC
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    const agentInput = document.getElementById('agent-input');
    const agentSend = document.getElementById('agent-send');
    const agentMessages = document.getElementById('agent-messages');
    const promptChips = document.querySelectorAll('.prompt-chip');

    const addMessage = (text, isUser = false, logs = []) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-msg' : 'bot-msg'}`;
        
        let content = '';
        if (!isUser && logs.length > 0) {
            logs.forEach(log => {
                content += `<div class="agent-log"><span>[PROCESS]</span> ${log}</div>`;
            });
        }
        
        content += `<p>${text}</p>`;
        msgDiv.innerHTML = content;
        
        agentMessages.appendChild(msgDiv);
        agentMessages.scrollTop = agentMessages.scrollHeight;
    };

    const addTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'message bot-msg';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        agentMessages.appendChild(indicator);
        agentMessages.scrollTop = agentMessages.scrollHeight;
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    };

    const handleAgentSend = async (customText = null) => {
        const text = customText || agentInput.value.trim();
        if (!text) return;

        if (!customText) agentInput.value = '';
        
        addMessage(text, true);
        
        agentInput.disabled = true;
        agentSend.disabled = true;

        // Fake agentic steps
        const steps = [
            "Analyzing user intent...",
            "Searching knowledge base...",
            "Fetching relevant project data...",
            "Synthesizing response..."
        ];

        addTypingIndicator();

        try {
            // Wait a bit for the "steps" to feel real
            await new Promise(resolve => setTimeout(resolve, 1500));

            const response = await fetch('gemini-api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: `Context: You are Akarshit's AI Agent. Akarshit is a Web Developer and AI Creator. 
                    Be professional, helpful, and creative. Answer this user query about Akarshit: ${text}` 
                })
            });

            removeTypingIndicator();

            if (!response.ok) {
                addMessage("I encountered a connection error while processing your request. Please try again.", false, ["Error detected in neural link"]);
            } else {
                const data = await response.json();
                if (data.reply) {
                    addMessage(data.reply, false, steps);
                } else {
                    addMessage("I'm sorry, I couldn't generate a response at this time.", false, ["System timeout"]);
                }
            }
        } catch (error) {
            removeTypingIndicator();
            console.error('Agent Error:', error);
            addMessage("Neural link failure. Please check your connection.", false, ["CRITICAL_ERROR"]);
        } finally {
            agentInput.disabled = false;
            agentSend.disabled = false;
            agentInput.focus();
        }
    };

    agentSend.addEventListener('click', () => handleAgentSend());
    agentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAgentSend();
    });

    promptChips.forEach(chip => {
        chip.addEventListener('click', () => {
            handleAgentSend(chip.textContent);
        });
    });
});
