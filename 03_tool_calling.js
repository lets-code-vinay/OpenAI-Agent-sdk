import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

const prompt = "email the current weather in imphal to vinay@abc.com?";

const sendEmailTool = tool({
  name: "sendEmailTool",
  description: "This tool will be used to send email",
  parameters: z.object({
    toEmail: z.string().describe("This is the email address of the recipient"),
    subject: z.string().describe("This is the subject of the email"),
    body: z.string().describe("This is the body of the email"),
  }),
  execute: async function ({ toEmail, subject, body }) {
    // In a real implementation, you would send the email using an email service.
    console.log(
      `Email sent to ${toEmail} with subject "${subject}" and body "${body}"`,
    );
    return `Email sent to ${toEmail}`;
  },
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
  tools: [weatherTool, sendEmailTool],
});

const getCurrentWeather = async (query = "") => {
  const result = await run(weatherAgent, query);
  console.log(result.finalOutput);
};

getCurrentWeather(prompt);
