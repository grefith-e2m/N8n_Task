import './style.css'
import { LeadAgent } from './agents/LeadAgent'
import { FAQAgent } from './agents/FAQAgent'
import { ScraperAgent } from './agents/ScraperAgent'
import { IntentAgent } from './agents/IntentAgent'
import faqs from './data/faqs.json'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div id="e2m-chatbot-container">
    <div class="chatbot-trigger" id="chatbot-trigger">
      <span>💬</span>
    </div>
    <div class="chatbot-modal" id="chatbot-modal">
      <div class="chatbot-header">
        <h2>E2M Solutions</h2>
        <p>Your White Label Partner</p>
      </div>
      <div class="chat-content" id="chat-content">
        <!-- Content will be dynamic -->
      </div>
      <div class="chat-input-area" id="chat-input-area" style="display: none;">
        <input type="text" id="user-input" placeholder="Type your question...">
        <button id="send-btn">Send</button>
      </div>
    </div>
  </div>
`

const trigger = document.getElementById('chatbot-trigger')!
const modal = document.getElementById('chatbot-modal')!
const content = document.getElementById('chat-content')!
const inputArea = document.getElementById('chat-input-area')!
const userInput = document.getElementById('user-input') as HTMLInputElement
const sendBtn = document.getElementById('send-btn')!

trigger.addEventListener('click', () => {
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex'
  initChat()
})

function initChat() {
  if (!LeadAgent.isRegistered()) {
    showLeadForm()
  } else {
    showChatInterface()
  }
}

function showLeadForm() {
  content.innerHTML = `
    <div class="lead-form">
      <p>Hello! Please provide your details to start the conversation.</p>
      <input type="text" id="lead-name" placeholder="Full Name" required>
      <input type="email" id="lead-email" placeholder="Email Address" required>
      <button class="btn-primary" id="start-chat-btn">Start Chat</button>
    </div>
  `
  document.getElementById('start-chat-btn')?.addEventListener('click', async () => {
    const name = (document.getElementById('lead-name') as HTMLInputElement).value
    const email = (document.getElementById('lead-email') as HTMLInputElement).value
    const btn = document.getElementById('start-chat-btn') as HTMLButtonElement;

    if (name && email) {
      try {
        btn.innerText = 'Connecting...';
        btn.disabled = true;
        await LeadAgent.registerUser(name, email)
        showChatInterface()
      } catch (e) {
        console.error(e);
        btn.innerText = 'Start Chat';
        btn.disabled = false;
        alert('Could not connect. Please check configuration.');
      }
    } else {
      alert('Please fill in both name and email.')
    }
  })
}

function showChatInterface() {
  inputArea.style.display = 'flex'
  const lead = LeadAgent.getLead();
  content.innerHTML = `
    <div class="message bot">
      Hi ${lead?.name || 'there'}! How can E2M Solutions help your agency today?
    </div>
    <div class="faq-container" id="faq-container"></div>
  `
  const faqContainer = document.getElementById('faq-container')!
  faqs.forEach(f => {
    const chip = document.createElement('div')
    chip.className = 'faq-chip'
    chip.innerText = f.question
    chip.onclick = () => handleMessage(f.question)
    faqContainer.appendChild(chip)
  })
}

async function handleMessage(text: string) {
  if (!text) return

  // Display User Message
  appendMessage(text, 'user')
  userInput.value = ''

  // Agent Logic
  const intent = IntentAgent.classify(text)
  let answer = FAQAgent.findMatch(text)
  let status: 'ANSWERED' | 'UNANSWERED' = 'ANSWERED';

  if (answer === 'NO_MATCH') {
    const scraped = ScraperAgent.answer(text)
    if (scraped === 'NO_ANSWER_FOUND') {
      status = 'UNANSWERED';
      answer = "Thank you for your query. Our team or the concerned person will review your request and contact you shortly.";
    } else {
      answer = scraped;
    }
  }

  // Display Bot Message
  setTimeout(async () => {
    appendMessage(answer, 'bot')
    await LeadAgent.logInteraction(text, answer, intent, status)
  }, 500)
}

function appendMessage(text: string, sender: 'user' | 'bot') {
  const msg = document.createElement('div')
  msg.className = `message ${sender}`
  msg.innerText = text
  content.appendChild(msg)
  content.scrollTop = content.scrollHeight
}

sendBtn.addEventListener('click', () => handleMessage(userInput.value))
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleMessage(userInput.value)
})
