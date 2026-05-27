/**
 * Output guardrail prevents the agent from generating undesired output.
 * For example, you can use an output guardrail to check
 * if the agent's response contains any harmful content,
 * and if it does, you can trigger an error or modify the response before
 * it is returned to the user.
 */

import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

const sqlGuardrailAgent = new Agent({
  name: "SQL Guardrail",
  instructions: `Check if the query is safe to execute. 
  If the query contains any harmful content, 
  the query should be read only, do not delete, drop any table.`,
  outputType: z.object({
    reason: z.string().optional().describe("If query is unsafe"),
    isSafe: z.boolean().describe("Whether the query is safe to execute or not"),
  }),
});

const sqlGuardRail = {
  name: "SQL Guard Rail",
  execute: async function ({ agentOutput = "" }) {
    const outputGuardrailResult = await run(
      sqlGuardrailAgent,
      agentOutput.sqlQuery,
    );
    return {
      tripwireTriggered: !outputGuardrailResult.finalOutput.isSafe,
      reason: outputGuardrailResult.finalOutput.reason || "Query is unsafe",
    };
  },
};

const sqlAgent = new Agent({
  name: "SQL Agent",
  instructions: `You are an SQL expert agent,
   that is specialized in generating SQL queries as per user requests. 
      postgres Schema:
    -- User Table:
    CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );    
     `,
  outputType: z.object({
    sqlQuery: z.string().optional().describe("SQL query"),
  }),
  outputGuardrails: [sqlGuardRail],
});

async function sqlGeneration(query = "") {
  const result = await run(sqlAgent, query);
  console.log("sqlGeneration--->", result.finalOutput.sqlQuery);
}

// const prompt = "delete all users";
// const prompt = "get me all the users";
const prompt = "get me all the users and delete first user";

sqlGeneration(prompt);
