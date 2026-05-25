import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import { z } from "zod";
import fs from "fs/promises";

const bookingTool = tool({
  name: "bookingTool",
  description:
    "This tool is used to book hotels, flights and cars for the users.",
  parameters: z.object({
    type: z.enum(["hotel", "flight", "car"]).describe("The type of booking"),
    custID: z
      .string()
      .default(() => `CUST_123`)
      .describe("The customer ID"),
    bookingDetails: z
      .string()
      .describe("The details of the booking such as date, time, location etc."),
  }),
  execute: async function ({ type, custID, bookingDetails }) {
    await fs.appendFile(
      "./bookingRecords.txt",
      `Booking Type: ${type}, Customer ID: ${custID}, Booking Details: ${bookingDetails}\n\n`,
      "utf-8",
    );
    return `Your ${type} has been booked successfully with the following details: ${bookingDetails}`;
  },
});

const refundTool = tool({
  name: "refundTool",
  description:
    "This tool is used to process refunds for the users and maintain the refund records.",
  parameters: z.object({
    custID: z.string().describe("The customer ID"),
    refundDetails: z
      .string()
      .describe("The details of the refund such as date, time, reason etc."),
  }),
  execute: async function ({ custID, refundDetails }) {
    console.log("Refund Tool Executed with:------------ ", {
      custID,
      refundDetails,
    });
    await fs.appendFile(
      "./refundRecords.txt",
      `Customer ID: ${custID}, Refund Details: ${refundDetails}\n`,
      "utf-8",
    );
    return `Your refund has been processed successfully with the following details: ${refundDetails}`;
  },
});

const bookingAgent = new Agent({
  name: "Booking Agent",
  description:
    "This agent is responsible for handling all booking related queries and tasks.",
  instructions: `You are a booking agent, 
    you can book hotels, flights, and cars for the users. 
    You have access to the following tools: bookingTool. Use this tool to book hotels, flights, and cars for the users based on their queries.`,
  model: "gpt-5.4",
  tools: [bookingTool],
});

const refundAgent = new Agent({
  name: "Refund Agent",
  description: `You are a refund agent and you have refundTool, you can process refunds for the users and maintain the refund records.`,

  instructions: ` 
    You MUST use the refundTool whenever user asks for:
    - cancellation
    - refund
    - return
    Do NOT just respond. Always call refundTool.`,

  model: "gpt-5.4",
  tools: [refundTool],
});

const receptionAgent = new Agent({
  name: "Reception Agent",
  description: `${RECOMMENDED_PROMPT_PREFIX},
    This agent is responsible for handling all the queries and tasks related to reception. It can handoff the tasks to booking agent and refund agent based on the user's query.`,
  instructions: `You are a reception agent, You should greet the users with respect and ask them about their queries. 
    Based on their queries, 
    
    Your ONLY job is to route the user to the correct agent.

    Rules:
    - Greet with respect and ask about their query.
    - If query is about booking → handoff to Booking Agent
    - If query is about cancellation or refund → handoff to Refund Agent
    - NEVER answer the query yourself
    - ALWAYS handoff`,
  model: "gpt-5.4",
  handoffDescription: `
    Route queries strictly:

    - Booking keywords: book, reserve, schedule → Booking Agent
    - Refund keywords: cancel, refund, return, reimbursement → Refund Agent

    If refund is mentioned, ALWAYS prefer Refund Agent
  `,
  handoffs: [bookingAgent, refundAgent],
});

async function runAgent(query = "") {
  const result = await run(receptionAgent, query);
  console.log("Final Output: ", result.finalOutput);
  return result.finalOutput;
}

const prompt =
  "Hi. My name is Vinay, i want to book a car for 3 days from today, for Delhi with my family. Can you help me with that?";

// const prompt =
//   "Hi. My name is Vinay, i booked a car and my customer Id is CUST_123, but now i want to cancel it and get a refund. Can you help me with that?";

runAgent(prompt);
