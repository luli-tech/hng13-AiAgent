import { createStep, createWorkflow } from "@mastra/core/workflows";

import { z } from "zod";

// Define schema for the fetched data
const countrySchema = z.object({
  name: z.string(),
  currency: z.string(),
  population: z.number(),
  gdpEstimate: z.string(),
});

// Step 1: Fetch country data
const fetchCountryData = createStep({
  id: "fetch-country-data",
  description:
    "Fetches a country's name, currency, population, and GDP estimate",
  inputSchema: z.object({
    country: z.string().describe("The country name"),
  }),
  outputSchema: countrySchema,
  execute: async ({ inputData }) => {
    const { country } = inputData;
    const API_URL =
      "https://restcountries.com/v3.1/all?fields=name,population,currencies,capital,region,subregion";

    const response = await fetch(API_URL);
    const countries = await response.json();

    const match = countries.find(
      (item: any) => item.name.toLowerCase() === country.toLowerCase()
    );

    if (!match) throw new Error(`Country "${country}" not found`);

    const gdpEstimate =
      match.population > 100_000_000
        ? "High GDP (estimated)"
        : match.population > 10_000_000
          ? "Medium GDP (estimated)"
          : "Low GDP (estimated)";

    return {
      name: match.name,
      capital: match.capital,
      region: match.region,
      subregion: match.subregioin,
      currency: match.currencies?.[0]?.name || "Unknown",
      population: match.population,
      gdpEstimate,
    };
  },
});

// Step 2: Summarize with an agent using `stream`
const summarizeCountryData = createStep({
  id: "summarize-country-data",
  description: "Summarizes the country data using a Mastra agent",
  inputSchema: countrySchema,
  outputSchema: z.object({
    summary: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent("countryAgent");
    if (!agent) throw new Error("Country agent not found");

    const prompt = `Summarize this country's data in one paragraph:\n${JSON.stringify(
      inputData,
      null,
      2
    )}`;

    const response = await agent.stream([
      {
        role: "user",
        content: prompt,
      },
    ]);

    let summaryText = "";

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      summaryText += chunk;
    }

    return {
      summary: summaryText,
    };
  },
});

// Step 3: Build workflow pipeline
export const countryWorkflow = createWorkflow({
  id: "country-workflow",
  inputSchema: z.object({
    country: z.string().describe("Country name to fetch and summarize"),
  }),
  outputSchema: z.object({
    summary: z.string(),
  }),
})
  .then(fetchCountryData)
  .then(summarizeCountryData);

countryWorkflow.commit();
