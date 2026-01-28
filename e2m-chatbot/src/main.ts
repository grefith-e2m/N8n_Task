import './style.css'
import { LeadAgent } from './agents/LeadAgent'
import { FAQAgent } from './agents/FAQAgent'
import { ScraperAgent } from './agents/ScraperAgent'
import { IntentAgent } from './agents/IntentAgent'
import faqs from './data/faqs.json'

// Declare lucide globally 
declare const lucide: any;

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div id="e2m-chatbot-container">
    <div class="chatbot-trigger" id="chatbot-trigger">
      <i data-lucide="message-square"></i>
    </div>
    <div class="chatbot-modal" id="chatbot-modal">
      <div class="chatbot-header">
        <h2>E2M Solutions</h2>
        <p>Premium White Label Partner</p>
      </div>
      <div class="chat-content" id="chat-content">
        <!-- Content will be dynamic -->
      </div>
      <div class="chat-input-area" id="chat-input-area" style="display: none;">
        <input type="text" id="user-input" placeholder="Ask your question...">
        <button id="send-btn">
          <i data-lucide="send"></i>
        </button>
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

// Helper to refresh icons
const refreshIcons = () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
};

// Initial icon refresh
refreshIcons();

trigger.addEventListener('click', () => {
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex'
  if (modal.style.display === 'flex') {
    initChat()
  }
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
      <p>Welcome! Please share your details to start the conversation.</p>
      <input type="text" id="lead-name" placeholder="Business Name or Full Name" required>
      <input type="email" id="lead-email" placeholder="Professional Email" required>
      <button class="btn-primary" id="start-chat-btn">Start Conversation</button>
    </div>
  `
  document.getElementById('start-chat-btn')?.addEventListener('click', () => {
    const name = (document.getElementById('lead-name') as HTMLInputElement).value
    const email = (document.getElementById('lead-email') as HTMLInputElement).value
    if (name && email) {
      LeadAgent.saveLead(name, email)
      showChatInterface()
    } else {
      alert('Please provide your name and email to continue.')
    }
  })
}

function showChatInterface() {
  inputArea.style.display = 'flex'
  content.innerHTML = `
    <div class="message bot">
      Hi ${LeadAgent.getLead().name}! How can E2M Solutions assist your agency growth today?
    </div>
    <div class="faq-container" id="faq-container"></div>
  `
  refreshIcons(); // In case any new icons were rendered

  const faqContainer = document.getElementById('faq-container')!
  faqs.forEach(f => {
    const chip = document.createElement('div')
    chip.className = 'faq-chip'
    chip.innerText = f.question
    chip.onclick = () => handleMessage(f.question)
    faqContainer.appendChild(chip)
  })
}

function handleMessage(text: string) {
  if (!text.trim()) return

  // Display User Message
  appendMessage(text, 'user')
  userInput.value = ''

  // Agent Logic
  const intent = IntentAgent.classify(text)
  let answer = FAQAgent.findMatch(text)
  let status: 'ANSWERED' | 'UNANSWERED' = 'ANSWERED'

  if (answer === 'NO_MATCH') {
    answer = ScraperAgent.answer(text)
  }

  if (answer === 'NO_ANSWER_FOUND') {
    status = 'UNANSWERED'
    answer = "Thank you for your query. Our team or the concerned person will review your request and get back to you shortly."
  }

  // Display Bot Message
  setTimeout(() => {
    appendMessage(answer, 'bot')
    LeadAgent.logInteraction(text, answer, intent, status)
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
