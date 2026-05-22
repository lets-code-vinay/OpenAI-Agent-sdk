import 'dotenv/config'
import {Agent, run} from '@openai/agents'

// const helloAgent = new Agent({
//     name: "Hello Agent",
//     instruction:"You are an agent who says hello world with user name",
// })

// const helloResult = await run(helloAgent, 'My name is Vinay Maurya')

// console.log('helloResult.output--', helloResult.output)
// console.log('helloResult.finalOutput--', helloResult.finalOutput)

const student = `Sonam Sharma is a sincere and hardworking student of Class 10. 
She is well-disciplined, respectful, and always eager to learn new things. 
Sonam performs well in academics and actively participates in sports and cultural activities. 
She is known for her good behavior, teamwork, and leadership qualities among classmates. 
Teachers appreciate her punctuality, positive attitude, and dedication towards studies. 
She is friendly, helpful, and always motivates others to do their best.`

const agent = new Agent({
    name: "Schooliko",
    // instructions: "What is name of the student, who is studying here?",
    // instruction:"You are a helpful assistant for school students, providing guidance on various subjects, study tips, and general advice to help them succeed academically and personally.",
    instructions: "How can Sonam improves her academic performance and overall development?",
    model: 'gpt-5.4',
})

const result = await run(agent, student)

console.log('result.finalOutput--', result.finalOutput)






