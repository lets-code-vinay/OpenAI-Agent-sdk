/**
 * In structure output we can define the structure of the output that we want from the agent.
 * This is useful when we want to get specific information from the agent in a structured format or to save in database in object or JSON form.
 * We can use zod to define the structure of the output.
 * This is especially useful when we want to get specific information from the agent and use it in our application.
 */

import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

const prompt = "What is the current weather in imphal?";

const weatherSchema = z.object({
  temperature: z.string().describe("Temperature in Celsius"),
  condition: z.string().optional().describe("Condition of weather"),
  advice: z.string().optional().describe("Advice based on weather conditions"),
  city: z.string().describe("The name of the city"),
});

const weatherTool = tool({
  name: "getWeatherTool",
  description:
    "This tool provides current weather information for a given location.",
  parameters: z.object({
    city: z.string().describe("The name of the city"),
  }),
  execute: async function ({ city }) {
    const weatherUrl = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(weatherUrl);
    console.log("------> ", response.data, city);
    // In a real implementation, you would fetch the weather data from an API based on the city parameter.
    return response.data;
  },
});

const weatherAgent = new Agent({
  name: "Weather Agent",
  instructions:
    "You are working in meterogological department, you have access to current weather data. Answer the user's query based on the data you have. also tell user what to do in this condition",
  model: "gpt-5.4",
  tools: [weatherTool],
  outputType: weatherSchema,
});

const getCurrentWeather = async (query = "") => {
  const result = await run(weatherAgent, query);
  console.log("------> `", result.finalOutput);
};

getCurrentWeather(prompt);

/**
 * {
  temperature: '27',
  condition: 'Haze',
  advice: 'It’s hazy and warm. If you’re going outside, consider wearing a mask if air quality feels poor, stay hydrated, and avoid long outdoor activity if you’re sensitive to haze.',
  city: 'Imphal'
}
 */
