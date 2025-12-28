const Workspace = require("../models/Workspace");

/**
 * POST /api/hint
 * Get AI-powered hint for query writing
 *
 * This is a placeholder implementation.
 * In production, this would integrate with an LLM API (OpenAI, Anthropic, etc.)
 */
async function generateHint(req, res) {
  try {
    const { workspaceId, query, tableContext } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: "Workspace ID is required",
      });
    }

    // Get workspace for context
    const workspace = await Workspace.findByWorkspaceId(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Build context for LLM
    const schemaContext = workspace.tables
      .map((table) => {
        const columns = table.columns
          .map((col) => `  - ${col.columnName} (${col.dataType})`)
          .join("\n");

        return `Table: ${table.tableName}\nColumns:\n${columns}`;
      })
      .join("\n\n");

    // PLACEHOLDER: In production, call LLM API here
    // Example prompt:
    const prompt = `
You are a helpful SQL tutor. The user is learning SQL and needs a hint (not the full answer).

Database Schema:
${schemaContext}

User's current query attempt:
${query || "User has not started yet"}

Additional context: ${tableContext || "None"}

Provide a helpful hint that guides the user toward the solution without giving away the complete answer. 
Focus on:
1. Which tables to use
2. What type of SQL statement might be needed
3. Key SQL concepts to consider
4. Common mistakes to avoid

Keep the hint educational and encouraging.
`;

    // PLACEHOLDER RESPONSE
    // In production, you would call:
    // const llmResponse = await callLLMAPI(prompt);

    const placeholderHint = generatePlaceholderHint(workspace.tables, query);

    res.json({
      success: true,
      data: {
        hint: placeholderHint,
        context: {
          tablesAvailable: workspace.tables.map((t) => t.tableName),
          prompt: prompt, // For debugging, remove in production
        },
      },
    });
  } catch (error) {
    console.error("Error generating hint:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate hint",
      message: error.message,
    });
  }
}

/**
 * Generate a simple rule-based hint (placeholder for LLM)
 */
function generatePlaceholderHint(tables, query) {
  if (!query || query.trim() === "") {
    return `Start by identifying which table(s) you need. Available tables: ${tables
      .map((t) => t.tableName)
      .join(", ")}. What data are you trying to retrieve or modify?`;
  }

  const lowerQuery = query.toLowerCase();

  // Detect query type
  if (lowerQuery.includes("select")) {
    if (!lowerQuery.includes("from")) {
      return "Hint: A SELECT statement needs a FROM clause to specify which table to query. Try adding FROM <table_name>.";
    }
    if (!lowerQuery.includes("where") && tables.length > 0) {
      return "Hint: Consider if you need a WHERE clause to filter your results. Not all queries need one, but they are useful for getting specific data.";
    }
    return "Hint: Check if you have specified all the columns you need in your SELECT clause, and verify the table name is correct.";
  }

  if (lowerQuery.includes("insert")) {
    if (!lowerQuery.includes("values")) {
      return "Hint: An INSERT statement needs a VALUES clause to specify what data to insert. Syntax: INSERT INTO table (columns) VALUES (values).";
    }
    return "Hint: Make sure the number of columns matches the number of values, and the data types are correct.";
  }

  if (lowerQuery.includes("update")) {
    if (!lowerQuery.includes("set")) {
      return "Hint: An UPDATE statement needs a SET clause to specify which columns to update. Syntax: UPDATE table SET column = value.";
    }
    if (!lowerQuery.includes("where")) {
      return "Hint: Be careful! Without a WHERE clause, UPDATE will modify ALL rows in the table. Add WHERE to target specific rows.";
    }
    return "Hint: Verify the column names and values in your SET clause are correct.";
  }

  if (lowerQuery.includes("delete")) {
    if (!lowerQuery.includes("where")) {
      return "Hint: Warning! DELETE without WHERE will remove ALL rows from the table. Use WHERE to specify which rows to delete.";
    }
    return "Hint: Make sure your WHERE clause correctly identifies the rows you want to delete.";
  }

  // Generic hint
  return `Think about what you are trying to accomplish. Common SQL commands: SELECT (retrieve data), INSERT (add data), UPDATE (modify data), DELETE (remove data). Available tables: ${tables
    .map((t) => t.tableName)
    .join(", ")}.`;
}

/**
 * TODO: Implement actual LLM integration
 * Example function signature for future implementation:
 *
 * async function callLLMAPI(prompt) {
 *   const response = await openai.chat.completions.create({
 *     model: "gpt-4",
 *     messages: [
 *       { role: "system", content: "You are a helpful SQL tutor." },
 *       { role: "user", content: prompt }
 *     ],
 *     temperature: 0.7,
 *     max_tokens: 200
 *   });
 *   return response.choices[0].message.content;
 * }
 */

module.exports = {
  generateHint,
};
