import { useState } from "react";
import { WorkspaceProvider } from "./context/WorkspaceContext";
import Navbar from "./components/Navbar";
import MainLayout from "./components/MainLayout";
import Sidebar from "./components/Sidebar";
import SchemaExplorer from "./components/SchemaExplorer";
import CreateTableModal from "./components/CreateTableModal";
import SQLEditor from "./components/SQLEditor";
import ResultViewer from "./components/ResultViewer";
import HintPanel from "./components/HintPanel";

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <WorkspaceProvider>
      <div className="h-screen flex flex-col bg-gray-100">
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
            <div className="h-1/2 bg-white border-b border-gray-200">
              <SQLEditor />
            </div>

            {/* Results Viewer (Bottom Half) */}
            <div className="h-1/2 bg-white">
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
    </WorkspaceProvider>
  );
};

export default App;
