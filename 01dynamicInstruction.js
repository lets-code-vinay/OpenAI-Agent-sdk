import 'dotenv/config'
import {Agent, run } from '@openai/agents'

const prompt = 'Hello i am Sonam, i am in college and i wanted to learn AI'

const userQuery = (userInput) => {
    if(userInput.includes('school')){
        return "You are mentor you should suggest user to focus on your academics, not on AI"
    } else {
        return "You are a senior AI engineer, Help user to build his/her career"
    }
}

const aiAgent = new Agent({
name:'Schooliko',
instructions: userQuery(prompt),

model:'gpt-5.4'

})

const result = await run(aiAgent, prompt)
console.log('result.finalOutput--', result.finalOutput)