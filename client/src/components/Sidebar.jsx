const Sidebar = ({ children }) => {
  return (
    <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Sidebar;
