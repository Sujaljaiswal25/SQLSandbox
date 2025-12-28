const MainLayout = ({ children }) => {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-100">{children}</div>
  );
};

export default MainLayout;
