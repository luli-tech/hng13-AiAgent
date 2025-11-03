import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { countryTool } from "../tools/countryTool";

export const countryAgent = new Agent({
  name: "Country Intelligence Agent",
  instructions: `
    You are a helpful and performance-driven agent specialized in providing information about countries.

    Your main objectives are:
      1. Retrieve country data (name, capital, region, subregion, population, and currency).
      2. Estimate GDP using a population-based formula.
      3. Format large numbers for readability.
      4. Present clear, structured, and concise information.
      5. Conclude with a short summary including activity level and impact level.

    Use the countryTool to retrieve real data before responding.
  
  `,
  model: "google/gemini-2.5-flash",
  tools: { countryTool },
  memory: new Memory({
    storage: new LibSQLStore({
      url: ":memory:",
    }),
  }),
});
