import { useState } from "react";
import { WorkspaceProvider, useWorkspace } from "./context/WorkspaceContext";
import Navbar from "./components/Navbar";
import MainLayout from "./components/MainLayout";
import Sidebar from "./components/Sidebar";
import SchemaExplorer from "./components/SchemaExplorer";
import CreateTableModal from "./components/CreateTableModal";
import SQLEditor from "./components/SQLEditor";
import ResultViewer from "./components/ResultViewer";
import HintPanel from "./components/HintPanel";

const WelcomeScreen = ({ onCreateWorkspace }) => {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl px-6">
        <div className="mb-8">
          <svg
            className="h-24 w-24 mx-auto text-blue-600 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
            />
          </svg>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to CipherSQL Sandbox
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A browser-based SQL playground to learn, experiment, and master SQL
            queries
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Get Started
          </h2>
          <button
            onClick={onCreateWorkspace}
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 mx-auto"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create Your First Workspace</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center mb-2">
              <svg
                className="h-6 w-6 text-green-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-semibold text-gray-800">Create Tables</h3>
            </div>
            <p className="text-sm text-gray-600">
              Build database schemas with columns and sample data
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center mb-2">
              <svg
                className="h-6 w-6 text-blue-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <h3 className="font-semibold text-gray-800">Write SQL</h3>
            </div>
            <p className="text-sm text-gray-600">
              Use the SQL editor to write and execute queries
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center mb-2">
              <svg
                className="h-6 w-6 text-purple-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h3 className="font-semibold text-gray-800">AI Hints</h3>
            </div>
            <p className="text-sm text-gray-600">
              Get smart hints to learn SQL, not just solutions
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center mb-2">
              <svg
                className="h-6 w-6 text-orange-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7"
                />
              </svg>
              <h3 className="font-semibold text-gray-800">Live Results</h3>
            </div>
            <p className="text-sm text-gray-600">
              See query results instantly in formatted tables
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentWorkspace } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  if (!currentWorkspace && showWelcome) {
    return <WelcomeScreen onCreateWorkspace={() => setShowWelcome(false)} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Navbar />

      <MainLayout>
        {/* Left Sidebar */}
        <Sidebar>
          <SchemaExplorer onCreateTable={() => setIsModalOpen(true)} />
          <HintPanel />
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* SQL Editor (Top Half) */}
          <div className="h-1/2 bg-white border-b-2 border-gray-200 shadow-sm">
            <SQLEditor />
          </div>

          {/* Results Viewer (Bottom Half) */}
          <div className="h-1/2 bg-gray-50">
            <ResultViewer />
          </div>
        </div>
      </MainLayout>

      {/* Create Table Modal */}
      <CreateTableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

const App = () => {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
};

export default App;
