/**
 * perform checks and validations on user input or agent output. For example, you may run a lightweight model as a guardrail before invoking an expensive model. If the guardrail detects malicious usage, it can trigger an error and stop the costly model from running.
 */
import "dotenv/config";
import { Agent, run } from "@openai/agents";
import { z } from "zod";

const mathValidationAgents = new Agent({
  name: "Maths Agents",
  description: `You are an expert Maths AI agent, 
    which checks and valdate user query and prompt, 
    it must be related to maths only`,
  outputType: z.object({
    isValidateMathQuery: z
      .boolean()
      .describe("Whether the user query is purely related to math or not"),
  }),
});

const mathsInputGuardRail = {
  name: "Maths Input Guard Rail",
  execute: async function ({ input = "" }) {
    const result = await run(mathValidationAgents, input);
    console.log("Validation Result: ", result.finalOutput.isValidateMathQuery);
    return {
      tripwireTriggered: !result.finalOutput.isValidateMathQuery,
    };
  },
};

const mainAgent = new Agent({
  name: "Main Agent",
  instructions: `You are an expert Maths AI agent, 
        You have to understand user queries, 
        if query is purely belongs to math. Then you will answer it yourself`,
  model: "gpt-5.4",
  inputGuardrails: [mathsInputGuardRail],
});

// const prompt = "What is the square root of 16?";
// const prompt = "What is the capital of Germany?";
// const prompt = "Write a email to my gf to tell her what is sum of 50+84+12?";
const prompt = "what is sum of 50+84+12?";

const calculation = async (query = "") => {
  const result = await run(mainAgent, query);
  console.log("Final Output: ", result.finalOutput);
  return result.finalOutput;
};

calculation(prompt);
