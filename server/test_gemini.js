import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using API Key:', apiKey ? 'FOUND (starts with ' + apiKey.substring(0, 5) + '...)' : 'MISSING');

async function testModel(model, responseSchema = null, enableSearch = false) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: "Find the name of a key decision maker at Google. Return JSON matching schema." }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 100,
    }
  };

  if (responseSchema) {
    payload.generationConfig.responseMimeType = "application/json";
    payload.generationConfig.responseSchema = responseSchema;
  }

  if (enableSearch) {
    payload.tools = [{ googleSearch: {} }];
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const status = res.status;
    const text = await res.text();
    console.log(`Model ${model} (schema=${!!responseSchema}, search=${enableSearch}) -> Status: ${status}`);
    console.log('Response:', text.substring(0, 300));
  } catch (error) {
    console.error(`Error testing ${model}:`, error);
  }
}

const schema = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" }
  },
  required: ["name"]
};

async function runTests() {
  console.log('--- Test 1: gemini-2.5-flash with search and schema ---');
  await testModel('gemini-2.5-flash', schema, true);

  console.log('\n--- Test 2: gemini-1.5-flash with search and schema ---');
  await testModel('gemini-1.5-flash', schema, true);

  console.log('\n--- Test 3: gemini-1.5-flash with search (NO SCHEMA) ---');
  await testModel('gemini-1.5-flash', null, true);

  console.log('\n--- Test 4: gemini-2.5-flash with search (NO SCHEMA) ---');
  await testModel('gemini-2.5-flash', null, true);

  console.log('\n--- Test 5: gemini-2.0-flash with search (NO SCHEMA) ---');
  await testModel('gemini-2.0-flash', null, true);
}

runTests();
