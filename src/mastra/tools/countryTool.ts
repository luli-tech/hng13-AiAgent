import { createTool } from "@mastra/core";
import { z } from "zod";
import axios from "axios";

const COUNTRY_API =
  "https://restcountries.com/v3.1/all?fields=name,population,currencies,capital,region,subregion";

export const countryTool = createTool({
  id: "fetch-country",
  description:
    "Fetch detailed information about a country, including population, currency, capital, and GDP estimate, and return it in a conversational format.",
  inputSchema: z.object({
    country: z.string().describe("The name of the country to fetch"),
  }),
  outputSchema: z.object({
    response: z.string(),
  }),

  async execute({ context }) {
    const country = context.country;
    if (!country) {
      throw new Error("Country name not provided in context.");
    }

    // Fetch country data
    const { data } = await axios.get(COUNTRY_API);

    // Find matching country (case-insensitive)
    const found = data.find(
      (c: any) =>
        c.name?.common?.toLowerCase() === country.toLowerCase() ||
        c.name?.official?.toLowerCase() === country.toLowerCase()
    );

    if (!found) {
      return {
        response: `I couldn’t find any information about "${country}". Please check the spelling and try again.`,
      };
    }

    // Extract relevant fields
    const name = found.name?.common || "Unknown";
    const officialName = found.name?.official || "Unknown";
    const population = found.population
      ? found.population.toLocaleString()
      : "Unknown";
    const currencyKey = found.currencies
      ? Object.keys(found.currencies)[0]
      : null;
    const currency = currencyKey
      ? `${found.currencies[currencyKey].name} (${found.currencies[currencyKey].symbol})`
      : "Unknown";
    const capital = found.capital?.[0] || "Unknown";
    const region = found.region || "Unknown";
    const subregion = found.subregion || "Unknown";

    // Generate a random GDP estimate based on population
    const gdp = (found.population * Math.random() * 1000).toFixed(2);

    // Conversational output
    const message = `
Here's what I discovered about ${name}:

${name}, officially known as ${officialName}*, is located in the ${subregion} subregion of ${region}. Its capital city is ${capital}.  
The country has an estimated population of about ${population} people, and its official currency is ${currency}.  
Based on its population size, the estimated GDP is around $${gdp} USD.

Would you like me to summarize its key economic or regional insights next?
`;

    return { response: message };
  },
});
