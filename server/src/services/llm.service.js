/**
 * LLM Service for SQL Hints
 * Uses Google Gemini API to generate educational hints
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Build schema description from workspace tables
 * @param {Array} tables - Array of table definitions
 * @returns {string} Formatted schema description
 */
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

/**
 * Build prompt for Gemini API
 * @param {Object} params - Prompt parameters
 * @param {Array} params.schema - Database schema (tables)
 * @param {string} params.userQuery - User's current query attempt
 * @param {string} params.userIntent - What user is trying to achieve
 * @param {string} params.errorContext - Any error they encountered (optional)
 * @returns {string} Complete prompt
 */
function buildPrompt({ schema, userQuery, userIntent, errorContext }) {
  const schemaDescription = buildSchemaDescription(schema);

  let prompt = `You are a SQL tutor helping a student learn SQL. Your role is to provide HINTS, not complete solutions.

DATABASE SCHEMA:
${schemaDescription}

`;

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

  prompt += `INSTRUCTIONS:
1. Provide a helpful HINT to guide the student, but do NOT give the complete solution
2. Suggest relevant SQL concepts (JOIN, GROUP BY, WHERE, ORDER BY, aggregate functions, etc.)
3. If there's an error, explain what might be wrong conceptually
4. Keep the hint concise (2-4 sentences)
5. Be encouraging and educational
6. Do not write the complete query - only guide them

Provide your hint:`;

  return prompt;
}

/**
 * Generate SQL hint using Gemini API
 * @param {Object} params - Parameters for hint generation
 * @param {Array} params.schema - Database schema (tables)
 * @param {string} params.userQuery - User's current query attempt
 * @param {string} params.userIntent - What user is trying to achieve
 * @param {string} params.errorContext - Any error they encountered
 * @returns {Promise<Object>} Hint response with success status and message
 */
async function generateHint({ schema, userQuery, userIntent, errorContext }) {
  try {
    // Validate input
    if (!schema || schema.length === 0) {
      return {
        success: false,
        error: "No database schema available. Please create some tables first.",
      };
    }

    if (!userIntent && !userQuery) {
      return {
        success: false,
        error:
          "Please provide either your goal or query attempt to get a helpful hint.",
      };
    }

    // Build prompt
    const prompt = buildPrompt({
      schema,
      userQuery,
      userIntent,
      errorContext,
    });

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });

    // Generate hint
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hintText = response.text();

    // Clean and validate response
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
    console.error("Error generating hint:", error);

    // Handle specific API errors
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

/**
 * Clean and format LLM response
 * Remove markdown formatting, extra whitespace, etc.
 * @param {string} hintText - Raw hint text from LLM
 * @returns {string} Cleaned hint text
 */
function cleanHintResponse(hintText) {
  if (!hintText) return "";

  let cleaned = hintText.trim();

  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/```sql\n/g, "").replace(/```\n?/g, "");

  // Remove excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Remove "Hint:" prefix if present
  cleaned = cleaned.replace(/^(Hint:|HINT:)\s*/i, "");

  return cleaned.trim();
}

/**
 * Generate context-aware hint based on error
 * @param {Object} params - Parameters
 * @param {Array} params.schema - Database schema
 * @param {string} params.query - Query that caused error
 * @param {Object} params.error - Error object with type and message
 * @returns {Promise<Object>} Hint response
 */
async function generateErrorHint({ schema, query, error }) {
  const errorContext = `Error Type: ${error.type}\nError Message: ${error.message}`;

  return generateHint({
    schema,
    userQuery: query,
    userIntent: "Fix the error in my query",
    errorContext,
  });
}

/**
 * Generate hint for query improvement
 * @param {Object} params - Parameters
 * @param {Array} params.schema - Database schema
 * @param {string} params.query - Working query to improve
 * @param {string} params.improvementGoal - What to improve (performance, readability, etc.)
 * @returns {Promise<Object>} Hint response
 */
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
