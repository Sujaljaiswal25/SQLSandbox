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
import ResizablePanel from "./components/ResizablePanel";
import VerticalResizablePanel from "./components/VerticalResizablePanel";

const WelcomeScreen = ({ onCreateWorkspace }) => {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center max-w-3xl px-6">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 blur-2xl opacity-20 rounded-full"></div>
            <svg
              className="h-20 w-20 mx-auto text-blue-600 relative"
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
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            CipherSQL Sandbox
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Learn SQL interactively with AI-powered hints in your browser
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <button
            onClick={onCreateWorkspace}
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-10 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
          >
            <span className="flex items-center space-x-3">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="font-semibold">Create Workspace</span>
            </span>
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-5">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg mr-3">
                <svg
                  className="h-6 w-6 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Schema Builder
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Design tables with custom columns and data types
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mr-3">
                <svg
                  className="h-6 w-6 text-blue-600"
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
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                SQL Editor
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Write and execute queries with syntax highlighting
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mr-3">
                <svg
                  className="h-6 w-6 text-purple-600"
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
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                AI Assistant
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Get intelligent hints powered by Google Gemini
            </p>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg mr-3">
                <svg
                  className="h-6 w-6 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Live Results
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Instant query results in beautifully formatted tables
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
        <ResizablePanel
          defaultLeftWidth={20}
          minLeftWidth={15}
          maxLeftWidth={40}
          leftPanel={
            <VerticalResizablePanel
              defaultTopHeight={60}
              minTopHeight={30}
              maxTopHeight={85}
              topPanel={
                <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
                  <div className="p-4">
                    <SchemaExplorer
                      onCreateTable={() => setIsModalOpen(true)}
                    />
                  </div>
                </div>
              }
              bottomPanel={
                <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
                  <div className="p-4">
                    <HintPanel />
                  </div>
                </div>
              }
            />
          }
          rightPanel={
            <VerticalResizablePanel
              defaultTopHeight={50}
              minTopHeight={20}
              maxTopHeight={80}
              topPanel={
                <div className="h-full bg-white border-b-2 border-gray-200 shadow-sm">
                  <SQLEditor />
                </div>
              }
              bottomPanel={
                <div className="h-full bg-gray-50">
                  <ResultViewer />
                </div>
              }
            />
          }
        />
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
