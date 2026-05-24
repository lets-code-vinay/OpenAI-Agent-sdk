/**
 * Manager (agents as tools) – a central agent owns the conversation and invokes specialized agents that are exposed as tools.
 */
import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
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
      .default(
        () => `CUST_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      )
      .describe("The customer ID"),
    bookingDetails: z
      .string()
      .describe("The details of the booking such as date, time, location etc."),
  }),
  execute: async function ({ type, custID, bookingDetails }) {
    await fs.appendFile(
      "./bookingRecords.txt",
      `Booking Type: ${type}, Customer ID: ${custID}, Booking Details: ${bookingDetails}\n`,
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
  instructions:
    "You are a booking agent, you can book hotels, flights, and cars for the users. You have access to the following tools: bookHotelTool, bookFlightTool, bookCarTool. Use these tools to book hotels, flights, and cars for the users based on their queries.",
  model: "gpt-5.4",
  tools: [bookingTool],
});

const refundAgent = new Agent({
  name: "Refund Agent",
  instructions:
    "You are a refund agent, you can process refunds for the users and maintain the refund records. ",
  model: "gpt-5.4",
  tools: [refundTool],
});

const receptionAgent = new Agent({
  name: "Reception Agent",
  instructions:
    "You are a reception agent, You can greet the users and ask them about their queries. Based on their queries, you can either transfer them to the booking agent or the refund agent.",
  model: "gpt-5.4",
  tools: [
    bookingAgent.asTool({
      toolName: "bookingAgentTool",
      description:
        "This tool is used to book hotels, flights and cars for the users. It has access to the booking agent which can book hotels, flights and cars for the users based on their queries.",
    }),
    refundAgent.asTool({
      toolName: "refundAgentTool",
      description:
        "This tool is used to process refunds for the users and maintain the refund records. It has access to the refund agent which can process refunds for the users and maintain the refund records based on their queries.",
    }),
  ],
});

// const prompt =
//   "Hi, I want to book a hotel in New York for 2 nights from 10th to 12th December. Can you help me with that?";

const prompt = `Hi, I want to cancel my hotel booking in New York which i booked for 2 nights. 
  Can you help me with that? 
    My customer ID is CUST_3QW9JMHWW.
  `;

const getResponse = async (query = "") => {
  const response = await run(receptionAgent, query);
  console.log("You request as been process", response.finalOutput);
};

getResponse(prompt);
