# Reflection: Fixing the Overdue Customer Timer Issue

**Course:** MSc IT Lab Project  
**Project:** Salon Queue Management System  
**Name:** Student Portfolio Submission  

---

### 1. What the Agent Got Wrong

While testing the salon workflow, I noticed a major bug with how customer service time was handled. 

When a customer sat in the chair, the timer started counting up (for example, for a 30-minute haircut). But even after the 30 minutes finished, nothing happened automatically. If the barber forgot to tap "Done" on their phone, the customer stayed stuck in the chair forever. The timer kept running up and up past 60 minutes, 90 minutes, and even crossed **120+ minutes**. 

Because the chair was stuck in "Busy" status for 120+ minutes:
- The barber's chair was completely blocked from taking the next customer.
- The receptionist could not call the next person in line.
- When the receptionist tried to click "Finish early", the system threw an error: *"No active in-chair customer found to complete"*.

The AI agent had assumed that barbers would always have their phone in hand and tap "Done" at the exact minute the haircut ended. But in a real salon, barbers are busy cutting hair and cleaning up, so the session got stuck in an endless loop.

---

### 2. How I Noticed It

I was doing a practice run of the application on the **Reception Dashboard (`/reception`)** on my laptop while testing with another mobile tab. 

I looked at Chair #1 (Ravi) and saw the timer was showing **128:45 / 30:00**, with the progress bar completely filled at 100%. The customer was already done and gone in real life, but the website still thought the haircut was going on after more than 2 hours! 

When I clicked the button to clear the chair, the red error message popped up saying no active customer was found. That meant the whole queue was frozen because the system thought Ravi was still busy.

---

### 3. How I Fixed It Using Prompts

Instead of leaving this broken, I wrote specific prompts to teach the agent how a real salon operates:

1. **Prompt to Give Receptionist Control**:  
   I told the agent: *"what if barber is completed task early and there should be option that he finished and ready to take new customer, and receptionist have ability to set that barber is on break or not"*.
   
2. **Prompt to Fix the Error**:  
   When the error appeared, I pasted the exact message: *"No active in-chair customer found to complete. what is this when i click on finish early"*. The agent fixed the code so that whether a customer is marked `called` or `in_chair`, the receptionist can always click **`[Finish early & free chair]`** to end the session immediately.

3. **Prompt to Remove Unnecessary Buttons**:  
   I realized barbers shouldn't even have to touch their phones while working, so I prompted: *"[Start Service] remove this feature, the only people manage the website is admin and receptionist"*. 

---

### 4. What I Learned

This taught me an important lesson about working with AI coding agents:

- **AI assumes perfect conditions**: The agent built a workflow where every person clicks every button at the exact right second. But in real life, people get distracted, walk away, or finish early.
- **Good prompt engineering means finding edge cases**: By testing the app like a real user and noticing the 120-minute runaway timer, I was able to write clear prompts that gave the receptionist an override button to free the chair anytime.
- This made the final project much more practical and reliable for a real business.
