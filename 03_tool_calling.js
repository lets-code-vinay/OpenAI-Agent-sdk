import 'dotenv/config'
import {Agent, run, tool} from '@openai/agents'
import {z} from 'zod'

const prompt = 'What is the current weather in Jaipur?'

const weatherTool= tool({
    name: "getWeatherTool",
    description: "This tool provides current weather information for a given location.",
    parameters: z.object({
        city: z.string().describe("The name of the city to get the weather information for")
    }),
    execute: async function({city}){
        // In a real implementation, you would fetch the weather data from an API based on the city parameter.
        return `The current weather in ${city} is 32°C with clear skies.`
    }

})

const weatherAgent = new Agent({
    name: "Weather Agent",
    instructions: "You are working in meterogological department, you have access to current weather data. Answer the user's query based on the data you have. also tell user what to do in this condition",
    model: 'gpt-5.4',
    tools: [weatherTool]
})


const getCurrentWeather = async (query = '') => {
    const result = await run(weatherAgent, query)
    console.log(result.finalOutput)
}

 getCurrentWeather(prompt)