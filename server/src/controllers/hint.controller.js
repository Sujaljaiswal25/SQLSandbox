const Workspace = require("../models/workspace.model");
const {
  generateHint: generateLLMHint,
  generateErrorHint,
} = require("../services/llm.service");

/**
 * POST /api/hint
 * Get AI-powered hint for query writing using Google Gemini
 *
 * Request Body:
 * - workspaceId: string (required) - Workspace ID for schema context
 * - query: string (optional) - User's current query attempt
 * - intent: string (optional) - What user is trying to achieve
 * - error: object (optional) - Error context if query failed
 */
async function generateHint(req, res) {
  try {
    const { workspaceId, query, intent, error } = req.body;

    // Validation
    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        error: "Workspace ID is required",
      });
    }

    if (!query && !intent) {
      return res.status(400).json({
        success: false,
        error:
          "Please provide either a query attempt or describe what you're trying to achieve",
      });
    }

    // Get workspace for schema context
    const workspace = await Workspace.findByWorkspaceId(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    // Check if workspace has tables
    if (!workspace.tables || workspace.tables.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "No tables exist in this workspace. Create some tables first to get SQL hints.",
      });
    }

    // Generate hint using LLM
    let hintResult;

    if (error && error.type) {
      // Generate error-specific hint
      hintResult = await generateErrorHint({
        schema: workspace.tables,
        query: query,
        error: error,
      });
    } else {
      // Generate general hint
      hintResult = await generateLLMHint({
        schema: workspace.tables,
        userQuery: query,
        userIntent: intent,
      });
    }

    if (!hintResult.success) {
      return res.status(500).json({
        success: false,
        error: hintResult.error,
        details: hintResult.details,
      });
    }

    res.json({
      success: true,
      data: {
        hint: hintResult.hint,
        context: {
          tablesUsed: hintResult.schemaUsed,
          tablesAvailable: workspace.tables.map((t) => t.tableName),
          hasQuery: !!query,
          hasIntent: !!intent,
          isErrorHint: !!error,
        },
      },
    });
  } catch (error) {
    console.error("Error in hint controller:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate hint",
      message: error.message,
    });
  }
}

/**
 * POST /api/hint/explain-error
 * Get hint specifically for understanding and fixing an error
 *
 * Request Body:
 * - workspaceId: string (required)
 * - query: string (required)
 * - error: object (required) - Error from query execution
 */
async function explainError(req, res) {
  try {
    const { workspaceId, query, error } = req.body;

    if (!workspaceId || !query || !error) {
      return res.status(400).json({
        success: false,
        error: "Workspace ID, query, and error are required",
      });
    }

    const workspace = await Workspace.findByWorkspaceId(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        error: "Workspace not found",
      });
    }

    const hintResult = await generateErrorHint({
      schema: workspace.tables,
      query: query,
      error: error,
    });

    if (!hintResult.success) {
      return res.status(500).json({
        success: false,
        error: hintResult.error,
      });
    }

    res.json({
      success: true,
      data: {
        explanation: hintResult.hint,
        errorType: error.type,
        originalError: error.message,
      },
    });
  } catch (error) {
    console.error("Error explaining error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to explain error",
      message: error.message,
    });
  }
}

module.exports = {
  generateHint,
  explainError,
};
