const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Build schema text from tables array
function buildSchemaDescription(tables) {
  if (!tables || tables.length === 0) {
    return "No tables exist in the workspace yet.";
  }

  return tables
    .map((table) => {
      const columnList = table.columns
        .map((col) => `  - ${col.columnName} (${col.dataType})`)
        .join("\n");
      return `Table: ${table.tableName}\n${columnList}`;
    })
    .join("\n\n");
}

// Create prompt for AI
function buildPrompt({ schema, userQuery, userIntent, errorContext }) {
  const hasSchema = schema && schema.length > 0;
  const schemaDescription = buildSchemaDescription(schema);

  let prompt = `You are a SQL tutor helping a student learn SQL. Your role is to provide HINTS, not complete solutions.

`;

  if (hasSchema) {
    prompt += `DATABASE SCHEMA:
${schemaDescription}

`;
  } else {
    prompt += `DATABASE SCHEMA:
No tables exist yet - student is just getting started.

`;
  }

  if (userIntent) {
    prompt += `STUDENT'S GOAL:
${userIntent}

`;
  }

  if (userQuery && userQuery.trim()) {
    prompt += `STUDENT'S CURRENT QUERY ATTEMPT:
\`\`\`sql
${userQuery}
\`\`\`

`;
  }

  if (errorContext) {
    prompt += `ERROR ENCOUNTERED:
${errorContext}

`;
  }

  // Adjust instructions based on context
  if (!hasSchema && !userQuery) {
    prompt += `INSTRUCTIONS:
1. The student is just getting started with SQL
2. Provide guidance on fundamental concepts like CREATE TABLE, data types, or basic SELECT queries
3. Be encouraging and explain concepts simply
4. Give a concrete example of what they could try first
5. Keep it concise (2-4 sentences)
6. Help them understand the basics before moving to advanced topics

Provide your helpful hint:`;
  } else {
    prompt += `INSTRUCTIONS:
1. Provide a helpful HINT to guide the student, but do NOT give the complete solution
2. Suggest relevant SQL concepts (JOIN, GROUP BY, WHERE, ORDER BY, aggregate functions, etc.)
3. If there's an error, explain what might be wrong conceptually
4. Keep the hint concise (2-4 sentences)
5. Be encouraging and educational
6. Do not write the complete query - only guide them

Provide your hint:`;
  }

  return prompt;
}

// Generate SQL hint using Gemini AI
async function generateHint({ schema, userQuery, userIntent, errorContext }) {
  try {
    if (!userIntent && !userQuery) {
      return {
        success: false,
        error:
          "Please provide either your goal or query attempt to get a helpful hint.",
      };
    }

    const prompt = buildPrompt({ schema, userQuery, userIntent, errorContext });
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hintText = response.text();
    const cleanedHint = cleanHintResponse(hintText);

    if (!cleanedHint || cleanedHint.length < 10) {
      throw new Error("Generated hint is too short or empty");
    }

    return {
      success: true,
      hint: cleanedHint,
      schemaUsed: schema.map((t) => t.tableName),
    };
  } catch (error) {
    if (error.message?.includes("API key")) {
      return {
        success: false,
        error: "LLM service configuration error. Please contact administrator.",
      };
    }

    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      return {
        success: false,
        error: "Hint service temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: "Failed to generate hint. Please try again.",
      details: error.message,
    };
  }
}

// Clean AI response text
function cleanHintResponse(hintText) {
  if (!hintText) return "";

  let cleaned = hintText.trim();
  cleaned = cleaned.replace(/```sql\n/g, "").replace(/```\n?/g, "");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.replace(/^(Hint:|HINT:)\s*/i, "");

  return cleaned.trim();
}

// Generate hint for SQL error
async function generateErrorHint({ schema, query, error }) {
  const errorContext = `Error Type: ${error.type}\nError Message: ${error.message}`;

  return generateHint({
    schema,
    userQuery: query,
    userIntent: "Fix the error in my query",
    errorContext,
  });
}

// Generate hint to improve query
async function generateImprovementHint({ schema, query, improvementGoal }) {
  return generateHint({
    schema,
    userQuery: query,
    userIntent: `Improve this query for: ${improvementGoal}`,
  });
}

module.exports = {
  generateHint,
  generateErrorHint,
  generateImprovementHint,
  buildSchemaDescription,
  buildPrompt,
};
